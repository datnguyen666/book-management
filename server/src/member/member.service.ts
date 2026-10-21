import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BorrowStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryMemberDto } from './dto/query-member.dto';
import { QueryMemberBorrowsDto } from './dto/query-member-borrows.dto';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách bạn đọc có phân trang, tìm kiếm và lọc trạng thái.
   */
  async findAll(dto: QueryMemberDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: Role.MEMBER,
    };

    if (dto.status === 'active') {
      where.isActive = true;
    } else if (dto.status === 'inactive') {
      where.isActive = false;
    }

    if (dto.search && dto.search.trim()) {
      const search = dto.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { memberCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, members] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          memberCode: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              borrowRecords: true,
            },
          },
          borrowRecords: {
            where: {
              status: BorrowStatus.BORROWING,
            },
            select: {
              id: true,
              dueDate: true,
            },
          },
        },
      }),
    ]);

    const now = new Date();

    const formattedData = members.map((member) => {
      const borrowingCount = member.borrowRecords.length;
      const overdueCount = member.borrowRecords.filter(
        (record) => new Date(record.dueDate) < now,
      ).length;

      return {
        id: member.id,
        username: member.username,
        email: member.email,
        fullName: member.fullName,
        phone: member.phone,
        memberCode: member.memberCode,
        isActive: member.isActive,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        totalBorrows: member._count.borrowRecords,
        borrowingCount,
        overdueCount,
      };
    });

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Lấy chi tiết hồ sơ bạn đọc kèm thống kê tổng quan.
   */
  async findById(id: number) {
    const member = await this.prisma.user.findFirst({
      where: {
        id,
        role: Role.MEMBER,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        memberCode: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Không tìm thấy tài khoản bạn đọc này');
    }

    const now = new Date();

    const [totalBorrows, borrowingCount, returnedCount, pendingCount, overdueCount] =
      await Promise.all([
        this.prisma.borrowRecord.count({
          where: { userId: id },
        }),
        this.prisma.borrowRecord.count({
          where: { userId: id, status: BorrowStatus.BORROWING },
        }),
        this.prisma.borrowRecord.count({
          where: { userId: id, status: BorrowStatus.RETURNED },
        }),
        this.prisma.borrowRecord.count({
          where: { userId: id, status: BorrowStatus.PENDING },
        }),
        this.prisma.borrowRecord.count({
          where: {
            userId: id,
            status: BorrowStatus.BORROWING,
            dueDate: { lt: now },
          },
        }),
      ]);

    return {
      ...member,
      stats: {
        totalBorrows,
        borrowingCount,
        returnedCount,
        pendingCount,
        overdueCount,
      },
    };
  }

  /**
   * Lấy lịch sử mượn trả sách của một bạn đọc cụ thể.
   */
  async findBorrowHistory(id: number, dto: QueryMemberBorrowsDto) {
    const member = await this.prisma.user.findFirst({
      where: {
        id,
        role: Role.MEMBER,
      },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException('Không tìm thấy tài khoản bạn đọc này');
    }

    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BorrowRecordWhereInput = {
      userId: id,
    };

    if (dto.status) {
      where.status = dto.status;
    }

    const [total, records] = await Promise.all([
      this.prisma.borrowRecord.count({ where }),
      this.prisma.borrowRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          borrowerName: true,
          borrowerCode: true,
          borrowedAt: true,
          dueDate: true,
          returnedAt: true,
          status: true,
          notes: true,
          rejectReason: true,
          renewCount: true,
          createdAt: true,
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
              author: true,
              coverImage: true,
              price: true,
            },
          },
          processedBy: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
      }),
    ]);

    const now = new Date();
    const formattedRecords = records.map((record) => {
      const isOverdue =
        record.status === BorrowStatus.BORROWING &&
        new Date(record.dueDate) < now;

      return {
        ...record,
        isOverdue,
      };
    });

    return {
      data: formattedRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Khóa hoặc Mở khóa tài khoản bạn đọc.
   */
  async updateStatus(id: number, isActive: boolean) {
    const member = await this.prisma.user.findFirst({
      where: { id },
      select: { id: true, role: true },
    });

    if (!member) {
      throw new NotFoundException('Không tìm thấy tài khoản bạn đọc');
    }

    if (member.role !== Role.MEMBER) {
      throw new BadRequestException(
        'Chỉ có thể khóa hoặc mở khóa tài khoản của Bạn đọc (Member)',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        memberCode: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }
}
