import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('This account is inactive');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return user;
  }
  async login(user: User): Promise<{ accessToken: string }> {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }

  async setPassword(token: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordSetupTokenHash: tokenHash,
        passwordSetupTokenExpiresAt: {
          gt: new Date(),
        },
        isActive: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password setup link');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        password: hashedPassword,

        mustChangePassword: false,

        passwordSetupTokenHash: null,

        passwordSetupTokenExpiresAt: null,
      },
    });

    return {
      message: 'Password has been set successfully',
    };
  }
}
