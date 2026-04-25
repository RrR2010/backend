import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateMembershipUseCase } from '@modules/memberships/application/create-membership.usecase';
import { ListMembershipUseCase } from '@modules/memberships/application/list-memberships.usecase';
import { CreateMembershipDto } from '@modules/memberships/interface/create-membership.dto';
import { CreateMembershipResponseDto } from '@modules/memberships/interface/create-membership-response.dto';
import { Authorize } from '@modules/authorization/interface/authorization.decorator';
import { PermissionAction, PermissionSubject } from '@core/domain/authorization';

@ApiTags('memberships')
@ApiBearerAuth('accessToken')
@Controller('memberships')
export class MembershipsController {
  constructor(
    private readonly createMembershipUseCase: CreateMembershipUseCase,
    private readonly listMembershipUseCase: ListMembershipUseCase,
  ) {}

  @Post()
  @Authorize({
    permission: { action: PermissionAction.Create, subject: PermissionSubject.Membership },
  })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async create(
    @Body() input: CreateMembershipDto,
  ): Promise<CreateMembershipResponseDto> {
    const membership = await this.createMembershipUseCase.execute(input);
    return CreateMembershipResponseDto.fromDomain(membership);
  }

  @Get()
  @Authorize({
    permission: { action: PermissionAction.Read, subject: PermissionSubject.Membership },
  })
  async list(): Promise<CreateMembershipResponseDto[]> {
    const Memberships = await this.listMembershipUseCase.execute();
    return Memberships.map((membership) =>
      CreateMembershipResponseDto.fromDomain(membership),
    );
  }
}
