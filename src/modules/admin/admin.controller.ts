import { Controller, Post, Body, Headers } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AdminService } from '@admin/admin.service'
import { BootstrapAdminDto } from '@admin/admin.dto'
import { Public } from '@shared/decorators/public.decorator'

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('bootstrap')
  async bootstrap(
    @Headers('x-bootstrap-key') bootstrapKey: string,
    @Body() dto: BootstrapAdminDto
  ): Promise<{ userId: string; identityId: string; membershipId: string; memberProfileId: string }> {
    // Set bootstrap key in config for validation
    process.env.BOOTSTRAP_KEY = bootstrapKey

    return this.adminService.bootstrap(dto.email, dto.password, dto.name)
  }
}
