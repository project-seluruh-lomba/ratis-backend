import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env: Record<string, string | undefined>) => {
        const requiredKeys = ['DATABASE_URL'];
        const missingKeys = requiredKeys.filter((key) => !env[key]);

        if (missingKeys.length > 0) {
          throw new Error(
            `Environment variable belum diisi: ${missingKeys.join(', ')}`,
          );
        }

        return env;
      },
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
