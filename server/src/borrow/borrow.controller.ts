import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Query,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { QueryBorrowDto } from './dto/query-borrow.dto';
import { RequestBorrowDto } from './dto/request-borrow.dto';
import { RejectBorrowDto } from './dto/reject-borrow.dto';

@ApiTags('Borrows')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('borrows')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Post('request')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Submit a book borrow request (for members)',
  })
  requestBorrow(@Body() dto: RequestBorrowDto, @Req() req: any) {
    return this.borrowService.requestBorrow(dto, req.user.id);
  }

  @Get('my-borrows')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get current user borrow history and active borrows',
  })
  findMyBorrows(@Query() query: QueryBorrowDto, @Req() req: any) {
    return this.borrowService.findMyBorrows(req.user.id, query);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Cancel a pending borrow request',
  })
  cancelBorrowRequest(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.borrowService.cancelBorrowRequest(id, req.user.id);
  }

  @Patch(':id/renew')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Renew / extend due date of an active borrow',
  })
  renewBorrow(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.borrowService.renewBorrow(id, req.user.id);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: 'Approve a borrow request and handover book',
  })
  approveBorrow(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.borrowService.approveBorrow(id, req.user.id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: 'Reject a borrow request',
  })
  rejectBorrow(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectBorrowDto,
    @Req() req: any,
  ) {
    return this.borrowService.rejectBorrow(id, req.user.id, dto);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: 'Create a book borrow record directly (at desk)',
  })
  create(@Body() dto: CreateBorrowDto, @Req() req: any) {
    return this.borrowService.create(dto, req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: 'Get all borrow records (for staff/admin)',
  })
  findAll(@Query() query: QueryBorrowDto) {
    return this.borrowService.findAll(query);
  }

  @Patch(':id/return')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: 'Return a borrowed book',
  })
  returnBook(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.borrowService.returnBook(id, req.user.id);
  }
}
