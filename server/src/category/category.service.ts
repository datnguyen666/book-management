import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    return await this.prisma.category.create({
      data: dto,
    });
  }
  catch(error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category already exists');
      }
    }
    throw error;
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return { data: categories };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}
