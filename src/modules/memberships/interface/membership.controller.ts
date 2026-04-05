import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateMembershipUseCase } from '@modules/memberships/application/create-membership.usecase';
import { ListMembershipUseCase } from '@modules/memberships/application/list-memberships.usecase';
import { CreateMembershipDto } from '@modules/memberships/interface/create-membership.dto';
import { CreateMembershipResponseDto } from '@modules/memberships/interface/create-membership-response.dto';

@ApiTags('memberships')
@Controller('memberships')
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
