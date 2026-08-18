import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { BookModule } from './book/book.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { DashboardModule } from './dashboard/dashboard.module';
import { StaffModule } from './staff/staff.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    CategoryModule,
    BookModule,
    DashboardModule,
    StaffModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
