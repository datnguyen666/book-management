import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const books = await this.prisma.book.findMany({
      select: {
        id: true,
        title: true,
        isbn: true,
        price: true,
        quantity: true,
        borrowedQuantity: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    let totalCopies = 0;
    let totalCollectionValue = 0;
    let borrowedValue = 0;
    let availableValue = 0;

    const data = books.map((book) => {
      const price = Number(book.price);

      const availableQuantity = book.quantity - book.borrowedQuantity;

      const totalValue = price * book.quantity;

      const bookBorrowedValue = price * book.borrowedQuantity;

      const bookAvailableValue = price * availableQuantity;

      totalCopies += book.quantity;

      totalCollectionValue += totalValue;
      borrowedValue += bookBorrowedValue;
      availableValue += bookAvailableValue;

      return {
        bookId: book.id,
        title: book.title,
        isbn: book.isbn,
        price,
        quantity: book.quantity,
        borrowedQuantity: book.borrowedQuantity,
        availableQuantity,
        totalValue,
        borrowedValue: bookBorrowedValue,
        availableValue: bookAvailableValue,
        category: book.category,
      };
    });

    return {
      totalTitles: books.length,
      totalCopies,
      totalCollectionValue,
      borrowedValue,
      availableValue,
      data,
    };
  }
}
