import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '@modules/users/interface/user-response.dto';
import { TenantResponseDto } from '@modules/tenants/interface/tenant-response.dto';

export class MeResponseDto {
  @ApiProperty()
  user!: UserResponseDto;

  @ApiProperty()
  tenant!: TenantResponseDto | null; // TODO: EPIC_005 - Allow null for platform-only users
}
