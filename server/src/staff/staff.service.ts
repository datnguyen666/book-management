import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { randomBytes, createHash } from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class StaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Get all staff accounts.
   */
  async findAll() {
    return this.prisma.user.findMany({
      where: {
        role: 'STAFF',
      },

      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Create a new staff account.
   */
  async create(dto: CreateStaffDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const username = await this.generateUsername(dto.email);

    /*
     * Temporary password.
     *
     * This will later be replaced by the actual
     * random-password + email invitation flow.
     */
    const temporaryPassword = this.generateTemporaryPassword();

    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const passwordSetupToken = this.generatePasswordSetupToken();

    const passwordSetupTokenHash = this.hashToken(passwordSetupToken);

    const passwordSetupTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const staff = await this.prisma.user.create({
      data: {
        username,
        email: dto.email,
        fullName: dto.fullName,
        password: hashedPassword,
        role: 'STAFF',
        isActive: true,

        mustChangePassword: true,
        passwordSetupTokenHash,
        passwordSetupTokenExpiresAt,
      },

      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.mailService
      .sendStaffInvitation({
        email: dto.email,
        fullName: dto.fullName,
        username,
        temporaryPassword,
        setupToken: passwordSetupToken,
      })
      .catch((error) => {
        console.error('Failed to send staff invitation email:', error);
      });

    return staff;
  }

  /**
   * Update staff information.
   */
  async update(id: number, dto: UpdateStaffDto) {
    const staff = await this.findStaff(id);

    if (dto.email && dto.email !== staff.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        ...(dto.email !== undefined && {
          email: dto.email,
        }),

        ...(dto.fullName !== undefined && {
          fullName: dto.fullName,
        }),
      },

      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Activate / deactivate staff account.
   */
  async updateStatus(id: number, isActive: boolean) {
    await this.findStaff(id);

    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        isActive,
      },

      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete staff account.
   */
  async remove(id: number) {
    await this.findStaff(id);

    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Staff deleted successfully',
    };
  }

  /**
   * Find one STAFF user.
   *
   * This prevents ADMIN accounts from being
   * updated/deleted through Staff Management.
   */
  private async findStaff(id: number) {
    const staff = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'STAFF',
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  private async generateUsername(email: string): Promise<string> {
    const baseUsername = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '');

    let username = baseUsername || 'staff';
    let counter = 1;

    while (
      await this.prisma.user.findUnique({
        where: {
          username,
        },
      })
    ) {
      counter += 1;
      username = `${baseUsername || 'staff'}${counter}`;
    }

    return username;
  }

  /**
   * Generate a temporary password.
   *
   * This is only the backend generation logic.
   * The password will later be sent through email.
   */
  private generateTemporaryPassword(): string {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';

    let password = '';

    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  }

  private generatePasswordSetupToken() {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
