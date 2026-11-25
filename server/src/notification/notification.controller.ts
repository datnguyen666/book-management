import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationScheduler } from './notification.scheduler';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationScheduler: NotificationScheduler,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách thông báo của người dùng hiện tại kèm số lượng chưa đọc',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách thông báo của người dùng',
  })
  async getMyNotifications(
    @Req() req: { user: { id: number } },
    @Query() query: QueryNotificationDto,
  ) {
    return this.notificationService.getUserNotifications(req.user.id, query);
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Đánh dấu tất cả thông báo của người dùng hiện tại là đã đọc',
  })
  async markAllAsRead(@Req() req: { user: { id: number } }) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Đánh dấu một thông báo cụ thể là đã đọc',
  })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: number } },
  ) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @Post('scan-overdue')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: 'Kích hoạt quét hạn trả sách thủ công (Dành cho Quản trị viên & Thủ thư)',
  })
  async triggerScanOverdue() {
    const stats = await this.notificationScheduler.scanDueDates();
    return {
      message: 'Kích hoạt quét hạn trả sách thành công',
      data: stats,
    };
  }
}
