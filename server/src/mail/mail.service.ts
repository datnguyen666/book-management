import { Injectable, Logger } from '@nestjs/common';
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
  private readonly transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<string>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: false,
        auth: {
          user,
          pass,
        },
      });
    } else {
      this.logger.warn(
        'Email configuration is missing or incomplete. Email sending will be disabled.',
      );
    }
  }

  async sendStaffInvitation(data: StaffInvitationMail) {
    if (!this.transporter) {
      this.logger.warn(
        `Skip sending staff invitation email to ${data.email}: Mail transporter is not configured.`,
      );
      return;
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'https://localhost:5173';
    const setupUrl = `${frontendUrl}/set-password?token=${data.setupToken}`;
    const from =
      this.configService.get<string>('MAIL_FROM') ||
      'Book Management <noreply@book.local>';

    await this.transporter.sendMail({
      from,
      to: data.email,
      subject: 'Your Book Management staff account',
      html: `
      <div style="margin:0; padding:0; background-color:#f5f1ea; font-family: Georgia, 'Times New Roman', serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.06);">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2b1608, #1f0f05); padding: 28px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#fdf6ec; font-size:15px; font-weight:bold; letter-spacing: 2px; font-family: Arial, sans-serif;">
                          📖 BOOK MANAGEMENT
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 36px 32px 8px 32px; font-family: Arial, sans-serif;">
                    <h1 style="margin:0 0 6px 0; font-size:22px; color:#2b1608; font-family: Georgia, serif;">
                      Welcome to Book Management
                    </h1>
                    <p style="margin:0 0 24px 0; font-size:14px; color:#6b6b6b; line-height:1.6;">
                      Hello <strong>${data.fullName}</strong>, an administrator has created a staff account for you. Here are your account details:
                    </p>

                    <!-- Credentials Card -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ec; border: 1px solid #e8b656; border-radius:8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:12px; color:#8c5520; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; padding-bottom:4px; font-family: Arial, sans-serif;">Username</td>
                            </tr>
                            <tr>
                              <td style="font-size:15px; color:#2b1608; font-family: monospace; font-weight:bold; padding-bottom:12px;">${data.username}</td>
                            </tr>
                            <tr>
                              <td style="font-size:12px; color:#8c5520; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; padding-bottom:4px; font-family: Arial, sans-serif;">Temporary Password</td>
                            </tr>
                            <tr>
                              <td style="font-size:15px; color:#2b1608; font-family: monospace; font-weight:bold; background:#fff; padding: 6px 10px; border-radius:4px; border: 1px dashed #c9a87a;">${data.temporaryPassword}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 20px 0; font-size:14px; color:#6b6b6b; line-height:1.6;">
                      Please click the button below to set your own password and activate your account:
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                      <tr>
                        <td style="border-radius:8px; background: linear-gradient(135deg, #5a3418, #2b1608);">
                          <a href="${setupUrl}"
                             style="display:inline-block; padding: 13px 28px; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px; font-family: Arial, sans-serif;">
                            Set Your Password &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 6px 0; font-size:13px; color:#9a9a9a; font-family: Arial, sans-serif;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin:0 0 24px 0; font-size:13px; word-break:break-all; font-family: Arial, sans-serif;">
                      <a href="${setupUrl}" style="color:#a6641e;">${setupUrl}</a>
                    </p>

                    <div style="border-left: 3px solid #e8b656; background:#fdf6ec; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin:0; font-size:13px; color:#5a4a2f; font-family: Arial, sans-serif; line-height:1.5;">
                        ⏱ This invitation link will expire in <strong>24 hours</strong>. You will be required to change your password upon first login.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px 28px 32px; border-top: 1px solid #f0ebe0; font-family: Arial, sans-serif;">
                    <p style="margin:0; font-size:12px; color:#b0b0b0;">
                      Book Management · This is an automated message, please don't reply.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
    });
  }

  async sendPasswordReset(data: PasswordResetMail) {
    if (!this.transporter) {
      this.logger.warn(
        `Skip sending password reset email to ${data.email}: Mail transporter is not configured.`,
      );
      return;
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'https://localhost:5173';
    const resetUrl = `${frontendUrl}/login?resetToken=${data.resetToken}`;
    const from =
      this.configService.get<string>('MAIL_FROM') ||
      'Book Management <noreply@book.local>';

    await this.transporter.sendMail({
      from,
      to: data.email,
      subject: 'Reset your Book Management password',
      html: `
      <div style="margin:0; padding:0; background-color:#f5f1ea; font-family: Georgia, 'Times New Roman', serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.06);">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2b1608, #1f0f05); padding: 28px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#fdf6ec; font-size:15px; font-weight:bold; letter-spacing: 2px; font-family: Arial, sans-serif;">
                          📖 BOOK MANAGEMENT
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 36px 32px 8px 32px; font-family: Arial, sans-serif;">
                    <h1 style="margin:0 0 6px 0; font-size:22px; color:#2b1608; font-family: Georgia, serif;">
                      Reset your password
                    </h1>
                    <p style="margin:0 0 20px 0; font-size:14px; color:#6b6b6b; line-height:1.6;">
                      Hello <strong>${data.fullName || 'there'}</strong>, we received a request to reset the password for your account.
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 8px 0 24px 0;">
                      <tr>
                        <td style="border-radius:8px; background: linear-gradient(135deg, #5a3418, #2b1608);">
                          <a href="${resetUrl}"
                             style="display:inline-block; padding: 13px 28px; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px; font-family: Arial, sans-serif;">
                            Reset your password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 6px 0; font-size:13px; color:#9a9a9a; font-family: Arial, sans-serif;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin:0 0 24px 0; font-size:13px; word-break:break-all; font-family: Arial, sans-serif;">
                      <a href="${resetUrl}" style="color:#a6641e;">${resetUrl}</a>
                    </p>

                    <div style="border-left: 3px solid #e8b656; background:#fdf6ec; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin:0; font-size:13px; color:#5a4a2f; font-family: Arial, sans-serif; line-height:1.5;">
                        ⏱ This link will expire in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email — your password won't be changed.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px 28px 32px; border-top: 1px solid #f0ebe0; font-family: Arial, sans-serif;">
                    <p style="margin:0; font-size:12px; color:#b0b0b0;">
                      Book Management · This is an automated message, please don't reply.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
    });
  }
}
