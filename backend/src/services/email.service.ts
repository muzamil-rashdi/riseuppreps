import { transporter } from '../config/email';
import { env } from '../config/env';

export class EmailService {
  private static isConfigured(): boolean {
    return !!(env.SMTP_USER && env.SMTP_PASS);
  }

  static async sendInviteEmail(to: string, role: string, inviteToken: string): Promise<void> {
    if (!this.isConfigured()) return;

    const inviteUrl = `${env.FRONTEND_URL}/register/${inviteToken}`;

    await transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject: `You're invited to join RiseUp Preps Academy as a ${role}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">RiseUp Preps Academy</h1>
            <p style="color: #6b7280; font-size: 14px;">Empowering futures through education</p>
          </div>
          <div style="background: #f8fafc; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">You've been invited!</h2>
            <p style="color: #475569; line-height: 1.6;">
              You have been invited to join <strong>RiseUp Preps Academy</strong> as a <strong>${role}</strong>.
            </p>
            <p style="color: #475569; line-height: 1.6;">
              Click the button below to create your account and get started.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background: #1e40af; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">
              This invitation expires in 72 hours. If you didn't expect this email, please ignore it.
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} RiseUp Preps Academy. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  }

  static async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    if (!this.isConfigured()) return;

    const resetUrl = `${env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject: 'Reset your RiseUp Preps Academy password',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">RiseUp Preps Academy</h1>
          </div>
          <div style="background: #f8fafc; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">Password Reset</h2>
            <p style="color: #475569; line-height: 1.6;">
              We received a request to reset your password. Click the button below to choose a new password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #1e40af; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">
              This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });
  }

  static async sendMarksNotification(
    to: string,
    sponsorName: string,
    studentName: string,
    quizName: string,
    marks: number,
    totalMarks: number
  ): Promise<void> {
    if (!this.isConfigured()) return;

    await transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject: `New marks posted for ${studentName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">RiseUp Preps Academy</h1>
          </div>
          <div style="background: #f8fafc; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">New Marks Posted</h2>
            <p style="color: #475569; line-height: 1.6;">
              Dear ${sponsorName},
            </p>
            <p style="color: #475569; line-height: 1.6;">
              New marks have been posted for <strong>${studentName}</strong>:
            </p>
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 5px 0; color: #1e293b;"><strong>Quiz/Test:</strong> ${quizName}</p>
              <p style="margin: 5px 0; color: #1e293b;"><strong>Score:</strong> ${marks}/${totalMarks}</p>
            </div>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${env.FRONTEND_URL}/sponsor" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    });
  }

  static async sendMessageNotification(to: string, senderName: string, messageSubject: string): Promise<void> {
    if (!this.isConfigured()) return;

    await transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject: `New message from ${senderName}: ${messageSubject}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">RiseUp Preps Academy</h1>
          </div>
          <div style="background: #f8fafc; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">New Message</h2>
            <p style="color: #475569; line-height: 1.6;">
              You have a new message from <strong>${senderName}</strong>.
            </p>
            <p style="color: #475569; line-height: 1.6;">
              Subject: <strong>${messageSubject}</strong>
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${env.FRONTEND_URL}/login" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                View Message
              </a>
            </div>
          </div>
        </div>
      `,
    });
  }
}
