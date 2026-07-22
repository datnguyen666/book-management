import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client/wasm';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(
      dto.username,
      dto.password,
    );

    return this.authService.login(user);
  }

  @Get('profile')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    const user = (req as Request & { user: any }).user;
    return user;
  }

  @Get('admin')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAdminData() {
    return {
      message: 'Welcome Admin!',
    };
  }
}
