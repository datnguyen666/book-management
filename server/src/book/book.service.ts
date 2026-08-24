import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Book, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateBookDto } from './dto/create-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto): Promise<{ data: Book }> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: dto.categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    try {
      const book = await this.prisma.book.create({
        data: {
          title: dto.title,
          isbn: dto.isbn,
          author: dto.author,
          publisher: dto.publisher,
          publishedDate: dto.publishedDate ? new Date(dto.publishedDate) : null,
          description: dto.description,
          price: new Prisma.Decimal(dto.price),
          quantity: dto.quantity,
          borrowedQuantity: 0,
          categoryId: dto.categoryId,
        },
      });
      return {
        data: book,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new ConflictException('ISBN already exists');
        }
      }

      throw error;
    }
  }

  async findAll(query: QueryBookDto) {
    const { page, limit } = query;

    const skip = (page - 1) * limit;

    const [books, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        skip,
        take: limit,
        orderBy: {
          id: 'asc',
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      this.prisma.book.count(),
    ]);

    return {
      data: books,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async search(q: string) {
    const query = q?.trim();

    if (!query) {
      return [];
    }

    const books = await this.prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
          { isbn: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
      },
      take: 10,
      orderBy: {
        title: 'asc',
      },
    });

    return books;
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },

      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return {
      data: book,
    };
  }

  async update(id: number, dto: UpdateBookDto) {
    const existingBook = await this.prisma.book.findUnique({
      where: {
        id,
      },
    });

    if (!existingBook) {
      throw new NotFoundException('Book not found');
    }

    if (dto.categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: dto.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    if (
      dto.quantity !== undefined &&
      dto.quantity < existingBook.borrowedQuantity
    ) {
      throw new BadRequestException(
        `Quantity cannot be less than borrowed quantity (${existingBook.borrowedQuantity})`,
      );
    }

    try {
      const book = await this.prisma.book.update({
        where: {
          id,
        },
        data: {
          title: dto.title,
          isbn: dto.isbn,
          author: dto.author,
          publisher: dto.publisher,
          publishedDate:
            dto.publishedDate !== undefined
              ? new Date(dto.publishedDate)
              : undefined,
          description: dto.description,
          price:
            dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
          quantity: dto.quantity,
          categoryId: dto.categoryId,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        message: 'Book updated successfully',
        data: book,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new ConflictException('ISBN already exists');

          case 'P2025':
            throw new NotFoundException('Book not found');
        }
      }

      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.book.delete({
        where: {
          id,
        },
      });

      return {
        message: 'Book deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Book not found');
      }

      throw error;
    }
  }

  async uploadCover(id: number, filename: string) {
    const existingBook = await this.prisma.book.findUnique({
      where: {
        id,
      },
    });

    if (!existingBook) {
      throw new NotFoundException('Book not found');
    }

    if (existingBook.coverImage) {
      const oldFilePath = path.join(
        process.cwd(),
        existingBook.coverImage.replace(/^\/+/, ''),
      );

      try {
        await fs.unlink(oldFilePath);
      } catch {
        // File không tồn tại hoặc không xóa được -> bỏ qua
      }
    }

    const book = await this.prisma.book.update({
      where: {
        id,
      },

      data: {
        coverImage: `/uploads/${filename}`,
      },

      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Cover image uploaded successfully',
      data: book,
    };
  }
}
