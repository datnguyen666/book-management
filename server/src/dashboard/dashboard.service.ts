import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [totalBooks, totalCategories, outOfStockBooks] = await Promise.all([
      this.prisma.book.count(),

      this.prisma.category.count(),

      this.prisma.book.count({
        where: {
          stock: 0,
        },
      }),
    ]);

    return {
      totalBooks,
      totalCategories,
      outOfStockBooks,
    };
  }
}
