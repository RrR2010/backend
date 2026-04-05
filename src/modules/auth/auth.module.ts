import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PasswordHasher } from './domain/password-hasher';
import { BcryptPasswordHasher } from './infra/bycript-password-hasher';
import { JwtService } from './domain/jwt.service';
import { JwtServiceImpl } from './infra/jwt.service.impl';
import { AuthController } from './interface/auth.controller';
import { LoginUseCase } from './application/login.usecase';
import { SelectTenantUseCase } from './application/select-tenant.usecase';
import { UsersModule } from '@modules/users/users.module';
import { MembershipModule } from '@modules/memberships/membership.module';
import { TenantModule } from '@modules/tenants/tenant.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MembershipModule,
    TenantModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'default-secret-change-in-production',
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: JwtService, useClass: JwtServiceImpl },
    LoginUseCase,
    SelectTenantUseCase,
  ],
  exports: [PasswordHasher, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
