import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateMemberStatusDto {
  @ApiProperty({
    description: 'Trạng thái kích hoạt tài khoản',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
