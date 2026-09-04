import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const now = new Date();

    // Current year
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const currentYear = now.getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    const [
      totalBooks,
      totalCategories,
      currentlyBorrowed,
      overdue,
      borrowingStatus,
      borrowsThisYear,
      topBorrowedBooks,

      booksThisYear,
      categoryBreakdown,
      recentBooks,
    ] = await Promise.all([
      // Total books
      this.prisma.book.count(),

      // Total categories
      this.prisma.category.count(),

      // Currently borrowed
      this.prisma.borrowRecord.count({
        where: {
          status: 'BORROWING',
        },
      }),

      // Overdue
      this.prisma.borrowRecord.count({
        where: {
          status: 'BORROWING',
          dueDate: {
            lt: startOfToday,
          },
        },
      }),

      // Borrowing status
      this.prisma.borrowRecord.groupBy({
        by: ['status'],
        _count: {
          _all: true,
        },
      }),

      // Borrow records during current year
      this.prisma.borrowRecord.findMany({
        where: {
          borrowedAt: {
            gte: startOfYear,
            lt: startOfNextYear,
          },
        },
        select: {
          borrowedAt: true,
        },
      }),

      // Top borrowed books
      this.prisma.borrowRecord.groupBy({
        by: ['bookId'],
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            bookId: 'desc',
          },
        },
        take: 5,
      }),

      // Books added during current year
      this.prisma.book.findMany({
        where: {
          createdAt: {
            gte: startOfYear,
            lt: startOfNextYear,
          },
        },
        select: {
          createdAt: true,
        },
      }),

      // Books by category
      this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              books: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),

      // Recently added books
      this.prisma.book.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    // =========================================================
    // Monthly acquisitions
    // =========================================================

    const monthlyAcquisitions = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      count: 0,
    }));

    for (const book of booksThisYear) {
      const month = book.createdAt.getMonth();

      monthlyAcquisitions[month].count++;
    }

    // =========================================================
    // Monthly borrowings
    // =========================================================

    const monthlyBorrowings = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      count: 0,
    }));

    for (const borrow of borrowsThisYear) {
      const month = borrow.borrowedAt.getMonth();

      monthlyBorrowings[month].count++;
    }

    // =========================================================
    // Borrowing status
    // =========================================================

    const borrowingStatusSummary = {
      borrowing: 0,
      returned: 0,
    };

    for (const item of borrowingStatus) {
      if (item.status === 'BORROWING') {
        borrowingStatusSummary.borrowing = item._count._all;
      }

      if (item.status === 'RETURNED') {
        borrowingStatusSummary.returned = item._count._all;
      }
    }

    // =========================================================
    // Top borrowed books
    // =========================================================

    const topBorrowedBookIds = topBorrowedBooks.map((item) => item.bookId);

    const topBorrowedBookDetails =
      topBorrowedBookIds.length > 0
        ? await this.prisma.book.findMany({
            where: {
              id: {
                in: topBorrowedBookIds,
              },
            },
            select: {
              id: true,
              title: true,
              isbn: true,
            },
          })
        : [];

    const topBorrowedBooksSummary = topBorrowedBooks
      .map((item) => {
        const book = topBorrowedBookDetails.find(
          (book) => book.id === item.bookId,
        );

        if (!book) {
          return null;
        }

        return {
          bookId: book.id,
          title: book.title,
          isbn: book.isbn,
          count: item._count._all,
        };
      })
      .filter((item) => item !== null);

    // =========================================================
    // Category breakdown
    // =========================================================

    const breakdown = categoryBreakdown.map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      count: category._count.books,
    }));

    // =========================================================
    // Final response
    // =========================================================

    return {
      totalBooks,
      totalCategories,

      currentlyBorrowed,
      overdue,

      borrowingStatus: borrowingStatusSummary,

      monthlyBorrowings: {
        year: currentYear,
        data: monthlyBorrowings,
      },

      topBorrowedBooks: topBorrowedBooksSummary,

      monthlyAcquisitions: {
        year: currentYear,
        data: monthlyAcquisitions,
      },

      categoryBreakdown: breakdown,

      recentBooks,
    };
  }
}
