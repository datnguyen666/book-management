import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account is inactive');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account is inactive');
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.username !== undefined) {
      data.username = dto.username.trim();
    }

    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName.trim();
    }

    if (dto.email !== undefined) {
      data.email = dto.email.trim();
    }

    if (dto.newPassword !== undefined) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'Current password is required to change password',
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        dto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      data.password = await bcrypt.hash(dto.newPassword, 10);

      data.mustChangePassword = false;

      data.passwordSetupTokenHash = null;
      data.passwordSetupTokenExpiresAt = null;

      data.passwordResetTokenHash = null;
      data.passwordResetTokenExpiresAt = null;
    }

    if (Object.keys(data).length === 0) {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data,
      });

      return {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target;

        if (Array.isArray(target) && target.includes('username')) {
          throw new ConflictException('Tên đăng nhập đã được sử dụng.');
        }

        if (Array.isArray(target) && target.includes('email')) {
          throw new ConflictException('Email already exists');
        }

        throw new ConflictException('Username or email already exists');
      }

      throw error;
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Do not reveal whether the email exists
    if (!user) {
      return {
        message: 'Please check your email',
      };
    }

    // Do not allow inactive accounts to reset password
    if (!user.isActive) {
      return {
        message: 'Please check your email',
      };
    }

    const resetToken = randomBytes(32).toString('hex');

    const resetTokenHash = createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetTokenHash: resetTokenHash,
        passwordResetTokenExpiresAt: resetTokenExpiresAt,
      },
    });

    await this.mailService.sendPasswordReset({
      email: user.email,
      fullName: user.fullName,
      resetToken,
    });

    return {
      message: 'Please check your email',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiresAt: {
          gt: new Date(),
        },
        isActive: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset link');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,

        mustChangePassword: false,

        passwordResetTokenHash: null,
        passwordResetTokenExpiresAt: null,
      },
    });

    return {
      message: 'Password has been reset successfully',
    };
  }

  async setPassword(
    token: string,
    currentPassword: string,
    newPassword: string,
  ) {
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

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Temporary password is incorrect');
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
