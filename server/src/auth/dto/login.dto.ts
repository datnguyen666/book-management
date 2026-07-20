import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string | undefined;

  @IsString()
  @IsNotEmpty()
  password: string | undefined;
}
