import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AdminLogService } from '../common/services/admin-log.service';

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
