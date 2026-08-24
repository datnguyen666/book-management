import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateBorrowDto {
  @ApiProperty({
    example: 'Nguyễn Văn A',
  })
  @IsString()
  @IsNotEmpty()
  borrowerName!: string;

  @ApiProperty({
    example: 'NV001',
  })
  @IsString()
  @IsNotEmpty()
  borrowerCode!: string;

  @ApiProperty({
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  bookId!: number;

  @ApiProperty({
    example: '2026-08-31',
  })
  @IsDateString()
  dueDate!: string;
}
