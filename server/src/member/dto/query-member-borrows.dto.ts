import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BorrowStatus } from '@prisma/client';

export class QueryMemberBorrowsDto {
  @ApiPropertyOptional({
    description: 'Trang hiện tại',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng mục trên một trang',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái phiếu mượn',
    enum: BorrowStatus,
    example: BorrowStatus.BORROWING,
  })
  @IsOptional()
  @IsEnum(BorrowStatus)
  status?: BorrowStatus;
}
