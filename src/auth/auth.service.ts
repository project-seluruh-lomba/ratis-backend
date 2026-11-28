import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, ShopStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterOwnerDto } from './dto/register.dto';
import { AdminLogService } from '../common/services/admin-log.service';
import { slugify } from '../common/utils/helpers';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private adminLog: AdminLogService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    const invalid = new UnauthorizedException('Email atau password salah');
    if (!user) throw invalid;
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw invalid;
    if (!user.isActive) throw new ForbiddenException('Akun dinonaktifkan');

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      role: user.role,
    });
    if (user.role === UserRole.ADMIN) {
      await this.adminLog
        .record({
          adminId: user.id,
          action: 'LOGIN',
          targetType: 'USER',
          targetId: user.id,
        })
        .catch(() => undefined);
    }

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(dto: RegisterOwnerDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const slug = await this.uniqueShopSlug(
      slugify(dto.shopName) || 'umkm-ratis',
    );

    let created: {
      user: { id: string; name: string; email: string; role: UserRole };
      shop: { id: string; name: string; slug: string; status: ShopStatus };
    };
    try {
      created = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: dto.name.trim(),
            email,
            passwordHash,
            role: UserRole.OWNER,
          },
          select: { id: true, name: true, email: true, role: true },
        });
        const shop = await tx.shop.create({
          data: {
            ownerId: user.id,
            name: dto.shopName.trim(),
            slug,
            description: dto.description.trim(),
            phone: dto.phone.trim(),
            address: dto.address.trim(),
            nib: dto.nib ?? null,
            photoUrl: dto.photoUrl?.trim() || null,
            status: ShopStatus.pending,
            statusHistories: {
              create: {
                fromStatus: null,
                toStatus: ShopStatus.pending,
                reason: 'Pendaftaran UMKM baru',
                changedById: null,
              },
            },
          },
          select: { id: true, name: true, slug: true, status: true },
        });
        return { user, shop };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email atau NIB sudah terdaftar');
      }
      throw error;
    }

    const accessToken = await this.jwt.signAsync({
      sub: created.user.id,
      role: created.user.role,
    });

    return {
      accessToken,
      user: created.user,
      shop: created.shop,
    };
  }

  private async uniqueShopSlug(base: string) {
    let slug = base;
    let i = 2;
    for (;;) {
      const found = await this.prisma.shop.findUnique({ where: { slug } });
      if (!found) return slug;
      slug = `${base}-${i++}`;
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Sesi tidak valid');
    if (!user.isActive) throw new ForbiddenException('Akun dinonaktifkan');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
