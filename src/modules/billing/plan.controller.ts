import { Controller, Get, Logger } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Public } from '@shared/decorators/public.decorator'
import { PlanService } from '@billing/plan.service'
import { PublicPlansResponseDto } from '@billing/plan.dto'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

@ApiTags('Plans')
@Controller('plans')
export class PlanController {
  private readonly logger = new Logger(PlanController.name)

  constructor(private readonly planService: PlanService) {}

  private getPlatformContext(): RequestContext {
    return {
      userId: 'system',
      scope: UserScope.PLATFORM,
      roles: [],
      impersonatedTenantId: null
    }
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all public plans' })
  async getPublicPlans(): Promise<PublicPlansResponseDto> {
    const ctx = this.getPlatformContext()
    const plans = await this.planService.getPublicPlans(ctx)
    return PublicPlansResponseDto.fromPlans(plans)
  }
}
