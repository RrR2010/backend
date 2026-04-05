import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/infra/prisma.module';
import { MembershipsController } from './interface/membership.controller';
import { CreateMembershipUseCase } from './application/create-membership.usecase';
import { ListMembershipUseCase } from './application/list-memberships.usecase';
import { MembershipRepository } from './domain/membership.repository';
import { PrismaMembershipRepository } from './infra/prisma-membership.repository';

@Module({
  imports: [PrismaModule],
  controllers: [MembershipsController],
  providers: [
    CreateMembershipUseCase,
    ListMembershipUseCase,
    { provide: MembershipRepository, useClass: PrismaMembershipRepository },
  ],
  exports: [MembershipRepository],
})
export class MembershipModule {}
