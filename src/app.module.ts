import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ApiExceptionFilter } from './common/utils/api-exception.filter';
import { ResponseEnvelopeInterceptor } from './common/utils/response-envelope.interceptor';
import { AdminShopsModule } from './admin/shops/admin-shops.module';
import { AdminCategoriesModule } from './admin/categories/admin-categories.module';
import { AdminDashboardModule } from './admin/dashboard/admin-dashboard.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env: Record<string, string | undefined>) => {
        const requiredKeys = ['DATABASE_URL', 'JWT_SECRET'];
        const missingKeys = requiredKeys.filter((key) => !env[key]);
        if (missingKeys.length > 0) {
          throw new Error(
            `Environment variable belum diisi: ${missingKeys.join(', ')}`,
          );
        }
        return env;
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    HealthModule,
    AdminShopsModule,
    AdminCategoriesModule,
    AdminDashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
  ],
})
export class AppModule {}
