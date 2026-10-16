import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectBorrowDto {
  @ApiPropertyOptional({
    example: 'Sách đang bảo trì tu bổ, không thể xuất mượn',
    description: 'Reason for rejecting borrow request',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
