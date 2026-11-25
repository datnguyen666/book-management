import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BorrowStatus, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

function formatDateVi(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Tác vụ tự động quét định kỳ vào 08:00 sáng mỗi ngày
   */
  @Cron('0 8 * * *')
  async handleDailyDueDateScan() {
    this.logger.log('Bắt đầu tác vụ tự động quét hạn trả sách (08:00 AM)...');
    try {
      const stats = await this.scanDueDates();
      this.logger.log(
        `Hoàn tất quét hạn trả sách: ${stats.dueSoonCount} tin sắp đến hạn, ${stats.overdueMemberCount} tin bạn đọc quá hạn, ${stats.overdueStaffCount} thông báo quản lý quá hạn.`,
      );
    } catch (error) {
      this.logger.error('Lỗi khi thực hiện quét hạn trả sách tự động:', error);
    }
  }

  /**
   * Phương thức quét hạn trả sách (có thể gọi tự động hoặc kích hoạt thủ công qua API)
   */
  async scanDueDates() {
    const now = new Date();

    // Xác định khoảng thời gian của ngày mai (00:00:00 -> 23:59:59 ngày mai)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfTomorrow = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate(),
      0,
      0,
      0,
      0,
    );

    const endOfTomorrow = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate(),
      23,
      59,
      59,
      999,
    );

    let dueSoonCount = 0;
    let overdueMemberCount = 0;
    let overdueStaffCount = 0;

    // 1. Quét sách sắp đến hạn trả (hạn trả rơi vào ngày mai)
    const dueSoonRecords = await this.prisma.borrowRecord.findMany({
      where: {
        status: BorrowStatus.BORROWING,
        dueDate: {
          gte: startOfTomorrow,
          lte: endOfTomorrow,
        },
      },
      include: {
        book: {
          select: { title: true },
        },
        member: {
          select: { id: true, fullName: true, username: true, memberCode: true },
        },
      },
    });

    for (const record of dueSoonRecords) {
      const alreadyNotified = await this.notificationService.hasNotification(
        record.memberId,
        record.id,
        NotificationType.DUE_SOON,
      );

      if (!alreadyNotified) {
        await this.notificationService.createNotification({
          userId: record.memberId,
          title: 'Sắp đến hạn trả sách',
          content: `Sách "${record.book.title}" sắp đến hạn trả vào ngày mai (${formatDateVi(record.dueDate)}). Vui lòng mang sách trả hoặc gia hạn nhé.`,
          type: NotificationType.DUE_SOON,
          link: '/my-borrows',
          borrowRecordId: record.id,
        });
        dueSoonCount++;
      }
    }

    // 2. Quét sách đã quá hạn trả (dueDate < now)
    const overdueRecords = await this.prisma.borrowRecord.findMany({
      where: {
        status: BorrowStatus.BORROWING,
        dueDate: {
          lt: now,
        },
      },
      include: {
        book: {
          select: { title: true },
        },
        member: {
          select: { id: true, fullName: true, username: true, memberCode: true },
        },
      },
    });

    for (const record of overdueRecords) {
      // 2a. Thông báo cho bạn đọc sở hữu phiếu
      const memberNotified = await this.notificationService.hasNotification(
        record.memberId,
        record.id,
        NotificationType.OVERDUE,
      );

      if (!memberNotified) {
        await this.notificationService.createNotification({
          userId: record.memberId,
          title: 'Sách đã quá hạn trả',
          content: `Sách "${record.book.title}" đã quá hạn trả từ ngày ${formatDateVi(record.dueDate)}. Vui lòng hoàn trả sách về thư viện để tránh bị tạm khóa tài khoản.`,
          type: NotificationType.OVERDUE,
          link: '/my-borrows',
          borrowRecordId: record.id,
        });
        overdueMemberCount++;
      }

      // 2b. Thông báo cho Ban quản lý (STAFF & ADMIN)
      // Kiểm tra xem đã gửi thông báo quá hạn của phiếu này tới ban quản lý chưa
      const staffNotifiedCount = await this.prisma.notification.count({
        where: {
          borrowRecordId: record.id,
          type: NotificationType.OVERDUE,
          user: {
            role: { in: ['ADMIN', 'STAFF'] },
          },
        },
      });

      if (staffNotifiedCount === 0) {
        const borrowerIdentifier =
          record.member.fullName || record.member.username;
        const codeSuffix = record.member.memberCode
          ? ` (${record.member.memberCode})`
          : '';

        await this.notificationService.createForStaffAndAdmin({
          title: 'Sách quá hạn trả',
          content: `Bạn đọc ${borrowerIdentifier}${codeSuffix} có sách "${record.book.title}" đã quá hạn trả từ ngày ${formatDateVi(record.dueDate)}.`,
          type: NotificationType.OVERDUE,
          link: '/borrows',
          borrowRecordId: record.id,
        });
        overdueStaffCount++;
      }
    }

    return {
      dueSoonCount,
      overdueMemberCount,
      overdueStaffCount,
      totalProcessed: dueSoonRecords.length + overdueRecords.length,
    };
  }
}
