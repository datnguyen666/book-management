import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BorrowStatus, Prisma, Role } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { QueryBorrowDto } from './dto/query-borrow.dto';
import { RequestBorrowDto } from './dto/request-borrow.dto';
import { RejectBorrowDto } from './dto/reject-borrow.dto';

const MAX_ACTIVE_BORROWS_PER_USER = 5;
const DEFAULT_BORROW_DAYS = 14;
const RENEW_DAYS = 14;

@Injectable()
export class BorrowService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Độc giả gửi yêu cầu mượn sách trực tuyến (Status: PENDING)
   */
  async requestBorrow(dto: RequestBorrowDto, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 1. Kiểm tra giới hạn số sách mượn cùng lúc (tối đa 5 cuốn đang chờ duyệt hoặc đang mượn)
    const activeBorrowCount = await this.prisma.borrowRecord.count({
      where: {
        memberId: userId,
        status: {
          in: [BorrowStatus.PENDING, BorrowStatus.BORROWING],
        },
      },
    });

    if (activeBorrowCount >= MAX_ACTIVE_BORROWS_PER_USER) {
      throw new BadRequestException(
        `Bạn đã đạt giới hạn tối đa ${MAX_ACTIVE_BORROWS_PER_USER} cuốn sách đang mượn hoặc chờ duyệt.`,
      );
    }

    // 2. Kiểm tra độc giả có sách quá hạn chưa trả không
    const overdueCount = await this.prisma.borrowRecord.count({
      where: {
        memberId: userId,
        status: BorrowStatus.BORROWING,
        dueDate: {
          lt: new Date(),
        },
      },
    });

    if (overdueCount > 0) {
      throw new BadRequestException(
        'Bạn có sách đã quá hạn chưa hoàn trả. Vui lòng hoàn trả sách trước khi tạo yêu cầu mượn mới.',
      );
    }

    // 3. Kiểm tra xem độc giả đã gửi yêu cầu hoặc đang mượn chính cuốn sách này chưa
    const duplicateRecord = await this.prisma.borrowRecord.findFirst({
      where: {
        memberId: userId,
        bookId: dto.bookId,
        status: {
          in: [BorrowStatus.PENDING, BorrowStatus.BORROWING],
        },
      },
    });

    if (duplicateRecord) {
      throw new BadRequestException(
        'Bạn đã có yêu cầu chờ duyệt hoặc đang mượn cuốn sách này.',
      );
    }

    // 4. Kiểm tra sách tồn tại và còn bản sao khả dụng
    const book = await this.prisma.book.findUnique({
      where: { id: dto.bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.quantity - book.borrowedQuantity <= 0) {
      throw new BadRequestException('Sách hiện đã hết bản sao khả dụng.');
    }

    // 5. Dự kiến ngày trả = 14 ngày tới
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + DEFAULT_BORROW_DAYS);

    const record = await this.prisma.borrowRecord.create({
      data: {
        memberId: user.id,
        bookId: dto.bookId,
        borrowedAt: new Date(),
        dueDate,
        status: BorrowStatus.PENDING,
        notes: dto.notes?.trim() || null,
        processedById: null,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            isbn: true,
            author: true,
            coverImage: true,
          },
        },
        member: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            memberCode: true,
          },
        },
      },
    });

    return {
      message: 'Gửi yêu cầu mượn sách thành công. Vui lòng chờ thư viện phê duyệt.',
      data: record,
    };
  }

  /**
   * Lấy danh sách lịch sử & sách đang mượn của chính độc giả đang đăng nhập
   */
  async findMyBorrows(userId: number, query: QueryBorrowDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BorrowRecordWhereInput = {
      memberId: userId,
      ...(status !== undefined && { status }),
      ...(search?.trim() && {
        OR: [
          {
            book: {
              title: {
                contains: search.trim(),
                mode: 'insensitive',
              },
            },
          },
          {
            book: {
              isbn: {
                contains: search.trim(),
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
    };

    const [records, total] = await this.prisma.$transaction([
      this.prisma.borrowRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
              author: true,
              coverImage: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          processedBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.borrowRecord.count({ where }),
    ]);

    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Độc giả hủy yêu cầu mượn khi đang ở trạng thái PENDING
   */
  async cancelBorrowRequest(id: number, userId: number) {
    const record = await this.prisma.borrowRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found');
    }

    if (record.memberId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể hủy yêu cầu của chính mình.');
    }

    if (record.status !== BorrowStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể hủy yêu cầu khi đang ở trạng thái chờ duyệt.');
    }

    const updated = await this.prisma.borrowRecord.update({
      where: { id },
      data: {
        status: BorrowStatus.CANCELLED,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return {
      message: 'Hủy yêu cầu mượn sách thành công.',
      data: updated,
    };
  }

  /**
   * Độc giả gia hạn mượn sách (+14 ngày, tối đa 1 lần nếu chưa quá hạn)
   */
  async renewBorrow(id: number, userId: number) {
    const record = await this.prisma.borrowRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found');
    }

    if (record.memberId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể gia hạn sách của chính mình.');
    }

    if (record.status !== BorrowStatus.BORROWING) {
      throw new BadRequestException('Chỉ có thể gia hạn sách đang trong trạng thái đang mượn.');
    }

    if (record.renewCount >= 1) {
      throw new BadRequestException('Cuốn sách này đã được gia hạn tối đa 1 lần.');
    }

    const now = new Date();
    if (new Date(record.dueDate) < now) {
      throw new BadRequestException(
        'Sách đã quá hạn hoàn trả, không thể gia hạn. Vui lòng mang sách trả tại quầy thư viện.',
      );
    }

    const newDueDate = new Date(record.dueDate);
    newDueDate.setDate(newDueDate.getDate() + RENEW_DAYS);

    const updated = await this.prisma.borrowRecord.update({
      where: { id },
      data: {
        dueDate: newDueDate,
        renewCount: {
          increment: 1,
        },
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return {
      message: `Gia hạn sách thành công thêm ${RENEW_DAYS} ngày.`,
      data: updated,
    };
  }

  /**
   * Staff/Admin phê duyệt & giao sách (PENDING -> BORROWING)
   */
  async approveBorrow(id: number, staffId: number) {
    const record = await this.prisma.borrowRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found');
    }

    if (record.status !== BorrowStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể duyệt yêu cầu đang ở trạng thái chờ duyệt.');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra số lượng sách và tăng borrowedQuantity
      const book = await tx.book.findUnique({
        where: { id: record.bookId },
      });

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      const updatedBookResult = await tx.book.updateMany({
        where: {
          id: record.bookId,
          borrowedQuantity: {
            lt: book.quantity,
          },
        },
        data: {
          borrowedQuantity: {
            increment: 1,
          },
        },
      });

      if (updatedBookResult.count === 0) {
        throw new BadRequestException('Sách đã hết bản sao khả dụng, không thể duyệt.');
      }

      // 2. Hạn trả 14 ngày kể từ thời điểm duyệt giao sách
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + DEFAULT_BORROW_DAYS);

      const updatedRecord = await tx.borrowRecord.update({
        where: { id },
        data: {
          status: BorrowStatus.BORROWING,
          borrowedAt: new Date(),
          dueDate,
          processedById: staffId,
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
              quantity: true,
              borrowedQuantity: true,
            },
          },
          processedBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      });

      const updatedBook = await tx.book.findUnique({
        where: { id: record.bookId },
        select: {
          id: true,
          title: true,
          quantity: true,
          borrowedQuantity: true,
        },
      });

      return {
        borrowRecord: updatedRecord,
        book: updatedBook,
      };
    });

    return {
      message: 'Duyệt yêu cầu và bàn giao sách thành công.',
      data: result,
    };
  }

  /**
   * Staff/Admin từ chối yêu cầu mượn (PENDING -> REJECTED)
   */
  async rejectBorrow(id: number, staffId: number, dto: RejectBorrowDto) {
    const record = await this.prisma.borrowRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found');
    }

    if (record.status !== BorrowStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể từ chối yêu cầu đang ở trạng thái chờ duyệt.');
    }

    const updated = await this.prisma.borrowRecord.update({
      where: { id },
      data: {
        status: BorrowStatus.REJECTED,
        rejectReason: dto.reason?.trim() || null,
        processedById: staffId,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return {
      message: 'Đã từ chối yêu cầu mượn sách.',
      data: updated,
    };
  }

  /**
   * Staff/Admin tạo trực tiếp phiếu mượn tại quầy (trạng thái BORROWING ngay)
   */
  async create(dto: CreateBorrowDto, processedById: number) {
    const dueDate = new Date(dto.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      throw new BadRequestException('Invalid due date');
    }

    if (dueDate <= new Date()) {
      throw new BadRequestException(
        'Due date must be later than the current date',
      );
    }

    // 1. Kiểm tra tài khoản bạn đọc
    const member = await this.prisma.user.findFirst({
      where: {
        id: dto.memberId,
        role: Role.MEMBER,
      },
    });

    if (!member) {
      throw new NotFoundException('Không tìm thấy tài khoản bạn đọc này.');
    }

    if (!member.isActive) {
      throw new BadRequestException(
        'Tài khoản bạn đọc đang bị khóa, không thể tạo phiếu mượn.',
      );
    }

    // 2. Kiểm tra giới hạn số sách mượn cùng lúc (tối đa 5 cuốn đang chờ duyệt hoặc đang mượn)
    const activeBorrowCount = await this.prisma.borrowRecord.count({
      where: {
        memberId: member.id,
        status: {
          in: [BorrowStatus.PENDING, BorrowStatus.BORROWING],
        },
      },
    });

    if (activeBorrowCount >= MAX_ACTIVE_BORROWS_PER_USER) {
      throw new BadRequestException(
        `Bạn đọc đã đạt giới hạn tối đa ${MAX_ACTIVE_BORROWS_PER_USER} cuốn sách đang mượn hoặc chờ duyệt.`,
      );
    }

    // 3. Kiểm tra bạn đọc có sách quá hạn chưa hoàn trả không
    const overdueCount = await this.prisma.borrowRecord.count({
      where: {
        memberId: member.id,
        status: BorrowStatus.BORROWING,
        dueDate: {
          lt: new Date(),
        },
      },
    });

    if (overdueCount > 0) {
      throw new BadRequestException(
        'Bạn đọc có sách đã quá hạn chưa hoàn trả. Vui lòng hoàn trả sách trước khi tạo phiếu mượn mới.',
      );
    }

    // 4. Kiểm tra xem bạn đọc đã có yêu cầu hoặc đang mượn chính cuốn sách này chưa
    const duplicateRecord = await this.prisma.borrowRecord.findFirst({
      where: {
        memberId: member.id,
        bookId: dto.bookId,
        status: {
          in: [BorrowStatus.PENDING, BorrowStatus.BORROWING],
        },
      },
    });

    if (duplicateRecord) {
      throw new BadRequestException(
        'Bạn đọc đã có yêu cầu chờ duyệt hoặc đang mượn cuốn sách này.',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 5. Kiểm tra Book tồn tại
      const book = await tx.book.findUnique({
        where: {
          id: dto.bookId,
        },
      });

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      // 6. Atomically tăng borrowedQuantity
      const updatedBookResult = await tx.book.updateMany({
        where: {
          id: dto.bookId,
          borrowedQuantity: {
            lt: book.quantity,
          },
        },
        data: {
          borrowedQuantity: {
            increment: 1,
          },
        },
      });

      // 7. Không còn sách available
      if (updatedBookResult.count === 0) {
        throw new BadRequestException('No available copies of this book');
      }

      // 8. Tạo Borrow Record liên kết với bạn đọc (memberId)
      const borrowRecord = await tx.borrowRecord.create({
        data: {
          memberId: member.id,
          bookId: dto.bookId,
          borrowedAt: new Date(),
          dueDate,
          status: BorrowStatus.BORROWING,
          processedById,
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
              quantity: true,
              borrowedQuantity: true,
            },
          },
          processedBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          member: {
            select: {
              id: true,
              username: true,
              fullName: true,
              email: true,
              memberCode: true,
            },
          },
        },
      });

      const updatedBook = await tx.book.findUnique({
        where: {
          id: dto.bookId,
        },
        select: {
          id: true,
          title: true,
          quantity: true,
          borrowedQuantity: true,
        },
      });

      return {
        borrowRecord,
        book: updatedBook,
      };
    });

    return {
      message: 'Book borrowed successfully',
      data: result,
    };
  }

  /**
   * Lấy toàn bộ danh sách mượn sách cho Staff/Admin quản lý
   */
  async findAll(query: QueryBorrowDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BorrowRecordWhereInput = {
      ...(status !== undefined && {
        status,
      }),
      ...(search?.trim() && {
        OR: [
          {
            member: {
              fullName: {
                contains: search.trim(),
                mode: 'insensitive',
              },
            },
          },
          {
            member: {
              username: {
                contains: search.trim(),
                mode: 'insensitive',
              },
            },
          },
          {
            member: {
              memberCode: {
                contains: search.trim(),
                mode: 'insensitive',
              },
            },
          },
          {
            member: {
              email: {
                contains: search.trim(),
                mode: 'insensitive',
              },
            },
          },
          {
            member: {
              phone: {
                contains: search.trim(),
                mode: 'insensitive',
              },
            },
          },
          {
            book: {
              title: {
                contains: search.trim(),
                mode: 'insensitive',
              },
            },
          },
          {
            book: {
              isbn: {
                contains: search.trim(),
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
    };

    const [records, total] = await this.prisma.$transaction([
      this.prisma.borrowRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
              quantity: true,
              borrowedQuantity: true,
              coverImage: true,
            },
          },
          member: {
            select: {
              id: true,
              username: true,
              fullName: true,
              email: true,
              phone: true,
              memberCode: true,
            },
          },
          processedBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.borrowRecord.count({
        where,
      }),
    ]);

    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Hoàn trả sách (BORROWING -> RETURNED)
   */
  async returnBook(id: number, staffId?: number) {
    const borrowRecord = await this.prisma.borrowRecord.findUnique({
      where: {
        id,
      },
    });

    if (!borrowRecord) {
      throw new NotFoundException('Borrow record not found');
    }

    if (borrowRecord.status === BorrowStatus.RETURNED) {
      throw new BadRequestException('This book has already been returned');
    }

    if (borrowRecord.status !== BorrowStatus.BORROWING) {
      throw new BadRequestException('Only books currently in borrowing status can be returned');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Giảm borrowedQuantity nếu vẫn > 0
      const updatedBookResult = await tx.book.updateMany({
        where: {
          id: borrowRecord.bookId,
          borrowedQuantity: {
            gt: 0,
          },
        },
        data: {
          borrowedQuantity: {
            decrement: 1,
          },
        },
      });

      if (updatedBookResult.count === 0) {
        throw new BadRequestException('Book borrowed quantity is already zero');
      }

      // 2. Đánh dấu Borrow Record đã trả
      const returnedRecord = await tx.borrowRecord.update({
        where: {
          id,
        },
        data: {
          status: BorrowStatus.RETURNED,
          returnedAt: new Date(),
          ...(staffId && { processedById: staffId }),
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
              quantity: true,
              borrowedQuantity: true,
            },
          },
          processedBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      });

      // 3. Lấy Book sau khi decrement
      const updatedBook = await tx.book.findUnique({
        where: {
          id: borrowRecord.bookId,
        },
        select: {
          id: true,
          title: true,
          quantity: true,
          borrowedQuantity: true,
        },
      });

      return {
        borrowRecord: returnedRecord,
        book: updatedBook,
      };
    });

    return {
      message: 'Book returned successfully',
      data: result,
    };
  }
}
