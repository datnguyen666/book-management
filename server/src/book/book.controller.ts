import {
  Body,
  Get,
  Controller,
  Post,
  UseGuards,
  Query,
  ParseIntPipe,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../common/upload/multer.config';

@ApiTags('Books')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new book',
  })
  create(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all books',
  })
  findAll(@Query() query: QueryBookDto) {
    return this.bookService.findAll(query);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search books by title, author or isbn',
  })
  search(@Query('q') q: string) {
    return this.bookService.search(q);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get book by id',
  })
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update book',
  })
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateBookDto,
  ) {
    return this.bookService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete book',
  })
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.bookService.remove(id);
  }

  @Post(':id/cover')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiOperation({ summary: 'Upload book cover' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadCover(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.bookService.uploadCover(id, file.filename);
  }
}
