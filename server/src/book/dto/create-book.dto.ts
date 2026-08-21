import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';

import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    example: 'Clean Code',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: '9780132350884',
  })
  @IsString()
  @IsNotEmpty()
  isbn!: string;

  @ApiProperty({
    example: 'Robert C. Martin',
  })
  @IsString()
  @IsNotEmpty()
  author!: string;

  @ApiPropertyOptional({
    example: 'Prentice Hall',
  })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional({
    example: '2008-08-01',
  })
  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @ApiPropertyOptional({
    example: 'A handbook of Agile software craftsmanship.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 39.99,
  })
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  price!: number;

  @ApiProperty({
    example: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiProperty({
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;
}
