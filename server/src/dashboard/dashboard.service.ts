import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const now = new Date();

    // Current year
    const currentYear = now.getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    const [
      totalBooks,
      totalCategories,
      booksThisYear,
      categoryBreakdown,
      recentBooks,
    ] = await Promise.all([
      // Total books
      this.prisma.book.count(),

      // Total categories
      this.prisma.category.count(),

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
        take: 10,
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

    // Initialize all 12 months
    const monthlyAcquisitions = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      count: 0,
    }));

    // Count books by month
    for (const book of booksThisYear) {
      const month = book.createdAt.getMonth();

      monthlyAcquisitions[month].count++;
    }

    // Format category breakdown
    const breakdown = categoryBreakdown.map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      count: category._count.books,
    }));

    return {
      totalBooks,
      totalCategories,

      monthlyAcquisitions: {
        year: currentYear,
        data: monthlyAcquisitions,
      },

      categoryBreakdown: breakdown,

      recentBooks,
    };
  }
}
