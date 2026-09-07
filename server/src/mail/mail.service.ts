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

                    <!-- Account info card -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ec; border-radius:8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 18px 20px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom: 10px; font-size:13px; color:#8a7a5c; width:130px;">Username</td>
                              <td style="padding-bottom: 10px; font-size:14px; color:#2b1608; font-weight:bold;">${data.username}</td>
                            </tr>
                            <tr>
                              <td style="font-size:13px; color:#8a7a5c;">Temporary password</td>
                              <td style="font-size:14px; color:#2b1608; font-weight:bold; font-family: 'Courier New', monospace;">${data.temporaryPassword}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 20px 0; font-size:14px; color:#6b6b6b; line-height:1.6;">
                      For security, please set your own password before signing in:
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                      <tr>
                        <td style="border-radius:8px; background: linear-gradient(135deg, #5a3418, #2b1608);">
                          <a href="${setupUrl}"
                             style="display:inline-block; padding: 13px 28px; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px; font-family: Arial, sans-serif;">
                            Set your password
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
                        ⏱ This link and temporary password will expire in <strong>24 hours</strong>. Please set your password before then.
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
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/login?resetToken=${data.resetToken}`;

    await this.transporter.sendMail({
      from: this.configService.getOrThrow<string>('MAIL_FROM'),
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
