import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryNotificationDto } from './dto/query-notification.dto';

export interface CreateNotificationParams {
  userId: number;
  title: string;
  content: string;
  type: NotificationType;
  link: string;
  borrowRecordId?: number | null;
}

export interface CreateStaffAdminNotificationParams {
  title: string;
  content: string;
  type: NotificationType;
  link: string;
  borrowRecordId?: number | null;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách thông báo và số lượng tin chưa đọc của người dùng
   */
  async getUserNotifications(userId: number, query: QueryNotificationDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const unreadOnly = query.unreadOnly === true;

    const where = {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const [records, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    return {
      data: records,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Thông báo không tồn tại hoặc không thuộc về bạn');
    }

    if (notification.isRead) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Đánh dấu tất cả thông báo của người dùng là đã đọc
   */
  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
      count: result.count,
    };
  }

  /**
   * Tạo 1 thông báo cho người dùng cụ thể
   */
  async createNotification(params: CreateNotificationParams) {
    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        content: params.content,
        type: params.type,
        link: params.link,
        borrowRecordId: params.borrowRecordId ?? null,
      },
    });
  }

  /**
   * Tạo thông báo gửi cho tất cả STAFF và ADMIN đang hoạt động
   */
  async createForStaffAndAdmin(params: CreateStaffAdminNotificationParams) {
    const staffAndAdmins = await this.prisma.user.findMany({
      where: {
        role: { in: [Role.STAFF, Role.ADMIN] },
        isActive: true,
      },
      select: { id: true },
    });

    if (staffAndAdmins.length === 0) {
      return { count: 0 };
    }

    const notificationsData = staffAndAdmins.map((u) => ({
      userId: u.id,
      title: params.title,
      content: params.content,
      type: params.type,
      link: params.link,
      borrowRecordId: params.borrowRecordId ?? null,
    }));

    return this.prisma.notification.createMany({
      data: notificationsData,
    });
  }

  /**
   * Kiểm tra thông báo đã tồn tại chưa để tránh tạo lặp lại
   */
  async hasNotification(
    userId: number,
    borrowRecordId: number,
    type: NotificationType,
  ): Promise<boolean> {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        borrowRecordId,
        type,
      },
    });

    return count > 0;
  }
}
