import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum LoginPortal {
  MEMBER = 'MEMBER',
  MANAGEMENT = 'MANAGEMENT',
}

export class LoginDto {
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    example: 'Admin@123',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({
    enum: LoginPortal,
    description: 'Cổng đăng nhập (MEMBER hoặc MANAGEMENT)',
    example: LoginPortal.MEMBER,
  })
  @IsOptional()
  @IsEnum(LoginPortal)
  portal?: LoginPortal;
}
