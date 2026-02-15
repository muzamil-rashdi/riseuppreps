import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { LoginInput, RegisterInput } from '../validators/auth.validators';
import { JwtTokens } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  static async login(input: LoginInput): Promise<{ user: Record<string, unknown>; tokens: JwtTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokenPayload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken },
    };
  }

  static async register(token: string, input: RegisterInput): Promise<{ user: Record<string, unknown>; tokens: JwtTokens }> {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
      throw new AppError('Invalid or expired invitation', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: invitation.email,
          passwordHash: hashedPassword,
          firstName: input.firstName,
          lastName: input.lastName,
          role: invitation.role,
          phone: input.phone,
        },
      });

      // Create student profile if role is STUDENT
      if (invitation.role === 'STUDENT') {
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      // Mark invitation as used
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });

      return newUser;
    });

    const tokenPayload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken },
    };
  }

  static async refresh(oldRefreshToken: string): Promise<JwtTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // If token was already used, invalidate all tokens for this user (token reuse detection)
      if (!storedToken) {
        await prisma.refreshToken.deleteMany({
          where: { userId: payload.userId },
        });
      }
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or deactivated', 401);
    }

    const tokenPayload = { userId: user.id, role: user.role, email: user.email };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  static async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) return;

    const token = uuidv4();
    // Store token as an invitation with special handling
    await prisma.invitation.create({
      data: {
        email: user.email,
        role: user.role,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        invitedBy: user.id,
      },
    });

    // Email sending is handled in the controller
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: invitation.email },
        data: { passwordHash: hashedPassword },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });

      // Invalidate all refresh tokens
      const user = await tx.user.findUnique({ where: { email: invitation.email } });
      if (user) {
        await tx.refreshToken.deleteMany({ where: { userId: user.id } });
      }
    });
  }
}
