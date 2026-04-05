import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'My Company', description: 'Tenant name.' })
  name!: string;
}
