import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberService } from './member.service';
import { QueryMemberDto } from './dto/query-member.dto';
import { QueryMemberBorrowsDto } from './dto/query-member-borrows.dto';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto';

@ApiTags('Members')
@ApiBearerAuth('JWT')
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách bạn đọc (hỗ trợ phân trang, tìm kiếm, lọc)',
  })
  findAll(@Query() dto: QueryMemberDto) {
    return this.memberService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một bạn đọc kèm số liệu thống kê',
  })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.memberService.findById(id);
  }

  @Get(':id/borrows')
  @ApiOperation({
    summary: 'Lấy lịch sử mượn trả sách của một bạn đọc',
  })
  findBorrowHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query() dto: QueryMemberBorrowsDto,
  ) {
    return this.memberService.findBorrowHistory(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Khóa hoặc mở khóa tài khoản bạn đọc',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMemberStatusDto,
  ) {
    return this.memberService.updateStatus(id, dto.isActive);
  }
}
