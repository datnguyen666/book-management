import { Controller, Get, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AssetService } from './asset.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { Role } from '@prisma/client';

@ApiTags('Assets')
@ApiBearerAuth('JWT')
@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get('summary')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: 'Get library asset summary',
  })
  async summary() {
    return this.assetService.summary();
  }
}
