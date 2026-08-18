import { Module } from '@nestjs/common';

import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
