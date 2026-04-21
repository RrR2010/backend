import { Module } from '@nestjs/common';
import { AdminController } from './interface/admin.controller';
import { AdminListSessionsUseCase } from './application/admin-list-sessions.usecase';
import { AdminRevokeSessionUseCase } from './application/admin-revoke-session.usecase';
import { AdminRevokeAllSessionsUseCase } from './application/admin-revoke-all-sessions.usecase';
import { AuthModule } from '@modules/authentication/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    AdminListSessionsUseCase,
    AdminRevokeSessionUseCase,
    AdminRevokeAllSessionsUseCase,
  ],
  controllers: [AdminController],
  exports: [
    AdminListSessionsUseCase,
    AdminRevokeSessionUseCase,
    AdminRevokeAllSessionsUseCase,
  ],
})
export class AdminModule {}
