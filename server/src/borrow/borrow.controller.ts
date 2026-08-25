import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { QueryBorrowDto } from './dto/query-borrow.dto';

@ApiTags('Borrows')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('borrows')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: 'Create a book borrow record',
  })
  create(@Body() dto: CreateBorrowDto, @Req() req: any) {
    return this.borrowService.create(dto, req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: 'Get borrow records',
  })
  findAll(@Query() query: QueryBorrowDto) {
    return this.borrowService.findAll(query);
  }
}
