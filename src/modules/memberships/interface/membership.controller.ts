import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateMembershipUseCase } from '@modules/memberships/application/create-membership.usecase';
import { ListMembershipUseCase } from '@modules/memberships/application/list-memberships.usecase';
import { CreateMembershipDto } from '@modules/memberships/interface/create-membership.dto';
import { CreateMembershipResponseDto } from '@modules/memberships/interface/create-membership-response.dto';
import { JwtAuthGuard } from '@modules/auth/infra/jwt-auth.guard';
import { TenantContextGuard } from '@modules/auth/infra/tenant-context.guard';

@ApiTags('memberships')
@ApiBearerAuth('accessToken')
@Controller('memberships')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class MembershipsController {
  constructor(
    private readonly createMembershipUseCase: CreateMembershipUseCase,
    private readonly listMembershipUseCase: ListMembershipUseCase,
  ) {}

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async create(
    @Body() input: CreateMembershipDto,
  ): Promise<CreateMembershipResponseDto> {
    const membership = await this.createMembershipUseCase.execute(input);
    return CreateMembershipResponseDto.fromDomain(membership);
  }

  @Get()
  async list(): Promise<CreateMembershipResponseDto[]> {
    const Memberships = await this.listMembershipUseCase.execute();
    return Memberships.map((membership) =>
      CreateMembershipResponseDto.fromDomain(membership),
    );
  }
}
