import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import * as bcrypt from 'bcrypt';

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
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : null;
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role,
        status: 'active',
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

    const token = this.generateToken(user.id, user.email, user.role, organizationId, creatorId);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId,
        creatorId,
      },
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
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
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
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
      accessToken: token,
    };
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
