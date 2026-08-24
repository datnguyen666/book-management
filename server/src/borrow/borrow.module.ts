import { Module } from '@nestjs/common';

import { BorrowController } from './borrow.controller';
import { BorrowService } from './borrow.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BorrowController],
  providers: [BorrowService],
})
export class BorrowModule {}
