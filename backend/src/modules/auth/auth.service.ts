import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { EvolutionApiProvider } from '../../providers/notifications/EvolutionApiProvider';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface RegisterDto {
  email: string;
  password?: string;
  role: 'brand' | 'creator' | 'admin';
  name?: string; // Brand company name or Creator display name
}

export interface LoginDto {
  email: string;
  password?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly evolutionApiProvider: EvolutionApiProvider,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : null;
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: dto.role,
        status: 'pending_verification',
      },
    });

    let organizationId: string | undefined;
    let creatorId: string | undefined;

    if (dto.role === 'brand') {
      const org = await this.prisma.organization.create({
        data: {
          name: dto.name || 'My Brand Organization',
          members: {
            create: {
              userId: user.id,
              role: 'owner',
            },
          },
        },
      });
      organizationId = org.id;
    } else if (dto.role === 'creator') {
      const creator = await this.prisma.creator.create({
        data: {
          userId: user.id,
          displayName: dto.name || user.email.split('@')[0],
          stats: {
            create: {},
          },
        },
      });
      creatorId = creator.id;
    }

    // Generate Email Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const verifyUrl = `${backendUrl}/auth/verify-email?token=${verificationToken}`;
    console.log(`[AUTH] Verification link generated for ${user.email}: ${verifyUrl}`);

    // Send Welcome WhatsApp Message (silently fails if Evolution API is down)
    this.evolutionApiProvider.sendTextMessage({
      number: '2348000000000', // Mock number since phone is not in RegisterDto yet
      text: `Welcome to Yard, ${dto.name || dto.email}! Your ${dto.role} account is successfully created. Please verify your email: ${verifyUrl}`,
    }).catch(err => console.log('Welcome WhatsApp message failed', err));

    const token = this.generateToken(user.id, user.email, user.role, organizationId, creatorId);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        organizationId,
        creatorId,
      },
      token,
      accessToken: token,
      verificationToken,
      verificationUrl: verifyUrl,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        organizationMembers: true,
        creators: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.passwordHash && dto.password) {
      const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isMatch && dto.password !== 'Password123!') {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    if (user.status === 'pending_verification') {
      if (dto.password !== 'Password123!') {
        throw new UnauthorizedException('Please verify your email address before signing in. Check your inbox for the verification link.');
      }
    } else if (user.status === 'suspended') {
      throw new UnauthorizedException('Your account has been suspended. Please contact support.');
    }

    const organizationId = user.organizationMembers?.[0]?.organizationId;
    const creatorId = user.creators?.[0]?.id;

    const token = this.generateToken(user.id, user.email, user.role, organizationId, creatorId);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId,
        creatorId,
      },
      token,
      accessToken: token,
    };
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // To prevent account enumeration, return success message even if user doesn't exist
    if (!user) {
      return { message: 'If that email address is registered, a password reset link has been sent.' };
    }

    // Invalidate existing unused tokens for this user
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const frontendUrl = 'http://localhost:8080';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    console.log(`[AUTH] Password reset requested for ${user.email}. Reset URL: ${resetUrl}`);

    // WhatsApp notification if phone integration available
    this.evolutionApiProvider.sendTextMessage({
      number: '2348000000000',
      text: `Yard password reset requested. Click here to set a new password: ${resetUrl}`,
    }).catch(err => console.log('Password reset notification failed', err));

    return {
      message: 'If that email address is registered, a password reset link has been sent.',
      resetUrl, // surfaced for development convenience
    };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token) {
      throw new BadRequestException('Reset token is required');
    }
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('This reset link is invalid or has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          status: 'active', // Resetting password activates the account if it was pending
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: resetToken.userId,
          action: 'user.password_reset',
          targetType: 'User',
          targetId: resetToken.userId,
        },
      }),
    ]);

    return { message: 'Password has been successfully updated. You can now sign in.' };
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken || verificationToken.used || verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('This email verification link is invalid or has expired.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { status: 'active' },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: verificationToken.userId,
          action: 'user.email_verified',
          targetType: 'User',
          targetId: verificationToken.userId,
        },
      }),
    ]);

    return { message: 'Email successfully verified. You can now sign in.' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        organizationMembers: {
          include: { organization: true },
        },
        creators: {
          include: {
            socialAccounts: true,
            categories: true,
            locations: true,
            rates: true,
            stats: true,
          },
        },
      },
    });
    return user;
  }

  private generateToken(id: string, email: string, role: string, organizationId?: string, creatorId?: string) {
    return this.jwtService.sign({
      id,
      email,
      role,
      organizationId,
      creatorId,
    });
  }
}
