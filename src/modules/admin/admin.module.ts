import { Module, forwardRef } from '@nestjs/common';
import { AdminController } from './interface/admin.controller';
import { AdminListSessionsUseCase } from './application/admin-list-sessions.usecase';
import { AdminRevokeSessionUseCase } from './application/admin-revoke-session.usecase';
import { AdminRevokeAllSessionsUseCase } from './application/admin-revoke-all-sessions.usecase';
import { AuthModule } from '@modules/authentication/auth.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [AuthModule, forwardRef(() => UsersModule)],
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
