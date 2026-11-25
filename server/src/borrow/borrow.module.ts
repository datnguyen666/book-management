import { Module } from '@nestjs/common';

import { BorrowController } from './borrow.controller';
import { BorrowService } from './borrow.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [BorrowController],
  providers: [BorrowService],
})
export class BorrowModule {}
