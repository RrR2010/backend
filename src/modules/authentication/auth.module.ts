import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PasswordHasher } from '@modules/authentication/domain/password-hasher';
import { BcryptPasswordHasher } from '@modules/authentication/infra/bycript-password-hasher';
import { TokenService } from '@modules/authentication/domain/token.service';
import { JwtService } from '@modules/authentication/infra/jwt.service';
import { JwtStrategy } from '@modules/authentication/infra/jwt.strategy';
import { JwtAuthGuard } from '@modules/authentication/infra/jwt-auth.guard';
import { TenantContextGuard } from '@modules/authentication/infra/tenant-context.guard';
import { AuthController } from '@modules/authentication/interface/auth.controller';
import { LoginUseCase } from '@modules/authentication/application/login.usecase';
import { SelectTenantUseCase } from '@modules/authentication/application/select-tenant.usecase';
import { MeUseCase } from '@modules/authentication/application/me.usecase';
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
    { provide: TokenService, useClass: JwtService },
    JwtStrategy,
    JwtAuthGuard,
    TenantContextGuard,
    LoginUseCase,
    SelectTenantUseCase,
    MeUseCase,
  ],
  exports: [PasswordHasher, TokenService, JwtAuthGuard, TenantContextGuard],
  controllers: [AuthController],
})
export class AuthModule {}
