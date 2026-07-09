import { Controller, Get, Post, Body, Param, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { SessionGuard } from '../auth/auth.guard';
import { SyndicationService, ListedUnitData, ListPayload } from './syndication.service';

@Controller('dashboard/syndication')
@UseGuards(SessionGuard)
export class SyndicationController {
  constructor(private readonly syndicationService: SyndicationService) {}

  @Get('listed')
  async getListedUnits(@Req() req: any): Promise<ListedUnitData[]> {
    if (req.user.role === 'tenant') {
      throw new BadRequestException('Access denied.');
    }
    const orgId = req.user.organizationId || null;
    const userId = req.user.id;
    return this.syndicationService.getListedUnits(orgId, userId);
  }

  @Post('list')
  async listUnits(
    @Body() payload: ListPayload,
    @Req() req: any
  ): Promise<{ success: boolean; count: number }> {
    if (req.user.role === 'tenant') {
      throw new BadRequestException('Access denied.');
    }
    const orgId = req.user.organizationId || null;
    const userId = req.user.id;
    return this.syndicationService.listUnits(payload, orgId, userId);
  }

  @Post('update-unit/:unitId')
  async updateListedUnit(
    @Param('unitId') unitId: string,
    @Body() payload: any,
    @Req() req: any
  ): Promise<{ success: boolean }> {
    if (req.user.role === 'tenant') {
      throw new BadRequestException('Access denied.');
    }
    const orgId = req.user.organizationId || null;
    const userId = req.user.id;
    return this.syndicationService.updateListedUnit(unitId, payload, orgId, userId);
  }

  @Post('unlist-unit/:unitId')
  async unlistUnit(
    @Param('unitId') unitId: string,
    @Req() req: any
  ): Promise<{ success: boolean }> {
    if (req.user.role === 'tenant') {
      throw new BadRequestException('Access denied.');
    }
    const orgId = req.user.organizationId || null;
    const userId = req.user.id;
    return this.syndicationService.unlistUnit(unitId, orgId, userId);
  }

  @Post('unlist-property/:propertyId')
  async unlistProperty(
    @Param('propertyId') propertyId: string,
    @Req() req: any
  ): Promise<{ success: boolean }> {
    if (req.user.role === 'tenant') {
      throw new BadRequestException('Access denied.');
    }
    const orgId = req.user.organizationId || null;
    const userId = req.user.id;
    return this.syndicationService.unlistProperty(propertyId, orgId, userId);
  }

  // Backwards compatibility endpoints
  @Get(':propertyId')
  async getSyndication(
    @Param('propertyId') propertyId: string,
    @Req() req: any
  ): Promise<any> {
    if (req.user.role === 'tenant') {
      throw new BadRequestException('Access denied.');
    }
    const orgId = req.user.organizationId || null;
    const userId = req.user.id;
    return this.syndicationService.getSyndication(propertyId, orgId, userId);
  }

  @Post(':propertyId')
  async updateSyndication(
    @Param('propertyId') propertyId: string,
    @Body() payload: any,
    @Req() req: any
  ): Promise<any> {
    if (req.user.role === 'tenant') {
      throw new BadRequestException('Access denied.');
    }
    const orgId = req.user.organizationId || null;
    const userId = req.user.id;
    return this.syndicationService.updateSyndication(propertyId, payload, orgId, userId);
  }

  @Post(':propertyId/publish')
  async publishSyndication(
    @Param('propertyId') propertyId: string,
    @Body('published') published: boolean,
    @Req() req: any
  ): Promise<any> {
    if (req.user.role === 'tenant') {
      throw new BadRequestException('Access denied.');
    }
    const orgId = req.user.organizationId || null;
    const userId = req.user.id;
    return this.syndicationService.publishSyndication(propertyId, published, orgId, userId);
  }
}
