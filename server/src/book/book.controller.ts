import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Books')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BookController {}
