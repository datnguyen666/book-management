import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';

import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryBookDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Tìm theo tên sách hoặc ISBN',
    example: 'Harry Potter',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo tác giả',
    example: 'J.K. Rowling',
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo thể loại',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}
