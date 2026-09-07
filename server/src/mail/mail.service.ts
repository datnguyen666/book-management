import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface StaffInvitationMail {
  email: string;
  fullName: string;
  username: string;
  temporaryPassword: string;
  setupToken: string;
}

interface PasswordResetMail {
  email: string;
  fullName: string;
  resetToken: string;
}

@Injectable()
export class MailService {
  private readonly transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('MAIL_HOST'),
      port: Number(this.configService.getOrThrow<string>('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.configService.getOrThrow<string>('MAIL_USER'),
        pass: this.configService.getOrThrow<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendStaffInvitation(data: StaffInvitationMail) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    const setupUrl = `${frontendUrl}/set-password?token=${data.setupToken}`;

    await this.transporter.sendMail({
      from: this.configService.getOrThrow<string>('MAIL_FROM'),

      to: data.email,

      subject: 'Your Book Management staff account',

      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome to Book Management</h2>

          <p>Hello ${data.fullName},</p>

          <p>
            An administrator has created a staff account for you.
          </p>

          <h3>Account information</h3>

          <p>
            <strong>Username:</strong> ${data.username}
          </p>

          <p>
            <strong>Temporary password:</strong>
            ${data.temporaryPassword}
          </p>

          <p>
            Please use the following link to set your new password:
          </p>

          <p>
            <a href="${setupUrl}">
              Set your password
            </a>
          </p>

          <p>
            This link will expire in 24 hours.
          </p>

          <p>
            Book Management
          </p>
        </div>
      `,
    });
  }

  async sendPasswordReset(data: PasswordResetMail) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    const resetUrl = `${frontendUrl}/login?resetToken=${data.resetToken}`;

    await this.transporter.sendMail({
      from: this.configService.getOrThrow<string>('MAIL_FROM'),

      to: data.email,

      subject: 'Reset your Book Management password',

      html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Reset your password</h2>

        <p>
          Hello ${data.fullName || 'there'},
        </p>

        <p>
          We received a request to reset your Book Management password.
        </p>

        <p>
          Please click the following link to create a new password:
        </p>

        <p>
          <a href="${resetUrl}">
            Reset your password
          </a>
        </p>

        <p>
          This link will expire in 1 hour.
        </p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>

        <p>
          Book Management
        </p>
      </div>
    `,
    });
  }
}
