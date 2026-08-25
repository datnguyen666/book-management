import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BorrowStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { QueryBorrowDto } from './dto/query-borrow.dto';

@Injectable()
export class BorrowService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBorrowDto, processedById: number) {
    const book = await this.prisma.book.findUnique({
      where: {
        id: dto.bookId,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const availableQuantity = book.quantity - book.borrowedQuantity;

    if (availableQuantity <= 0) {
      throw new BadRequestException('No available copies of this book');
    }

    const dueDate = new Date(dto.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      throw new BadRequestException('Invalid due date');
    }

    if (dueDate <= new Date()) {
      throw new BadRequestException(
        'Due date must be later than the current date',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const borrowRecord = await tx.borrowRecord.create({
        data: {
          borrowerName: dto.borrowerName.trim(),
          borrowerCode: dto.borrowerCode.trim(),
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
        },
      });

      const updatedBook = await tx.book.update({
        where: {
          id: dto.bookId,
        },
        data: {
          borrowedQuantity: {
            increment: 1,
          },
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

  async findAll(query: QueryBorrowDto) {
    const { page, limit, search, status } = query;

    const skip = (page - 1) * limit;

    const where = {
      ...(status !== undefined && {
        status,
      }),

      ...(search?.trim() && {
        OR: [
          {
            borrowerName: {
              contains: search.trim(),
              mode: 'insensitive' as const,
            },
          },
          {
            borrowerCode: {
              contains: search.trim(),
              mode: 'insensitive' as const,
            },
          },
          {
            book: {
              title: {
                contains: search.trim(),
                mode: 'insensitive' as const,
              },
            },
          },
          {
            book: {
              isbn: {
                contains: search.trim(),
                mode: 'insensitive' as const,
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
          borrowedAt: 'desc',
        },

        include: {
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
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

  async returnBook(id: number) {
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

    const result = await this.prisma.$transaction(async (tx) => {
      const returnedRecord = await tx.borrowRecord.update({
        where: {
          id,
        },
        data: {
          status: BorrowStatus.RETURNED,
          returnedAt: new Date(),
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

      const updatedBook = await tx.book.update({
        where: {
          id: borrowRecord.bookId,
        },
        data: {
          borrowedQuantity: {
            decrement: 1,
          },
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
