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
}
