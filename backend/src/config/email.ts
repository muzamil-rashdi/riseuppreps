import nodemailer from 'nodemailer';
import { env } from './env';

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        }
      : undefined,
});

export async function verifyEmailConnection(): Promise<boolean> {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('Email not configured: SMTP_USER or SMTP_PASS missing. Email notifications disabled.');
    return false;
  }

  try {
    await transporter.verify();
    console.info('Email service connected successfully');
    return true;
  } catch (error) {
    console.warn('Email service connection failed. Notifications will be skipped.', error);
    return false;
  }
}
