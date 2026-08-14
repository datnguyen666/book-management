import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({
    example: 'staff@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName!: string;
}
