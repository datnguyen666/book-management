import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateBorrowDto {
  @ApiProperty({
    example: 1,
    description: 'ID tài khoản bạn đọc (Member)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  memberId!: number;

  @ApiProperty({
    example: 1,
    description: 'ID sách cần mượn',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  bookId!: number;

  @ApiProperty({
    example: '2026-08-31',
    description: 'Ngày hẹn hoàn trả',
  })
  @IsDateString()
  dueDate!: string;
}
