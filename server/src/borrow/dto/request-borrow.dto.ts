import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class RequestBorrowDto {
  @ApiProperty({
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  bookId!: number;

  @ApiPropertyOptional({
    example: 'Tôi muốn mượn sách này để đọc và nghiên cứu',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
