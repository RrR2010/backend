/**
 * Permissions Module
 *
 * Module for CASL-based authorization system.
 * Provides ability factory for creating permissions based on roles.
 * Roles are resolved from database for security.
 */
import { Module } from '@nestjs/common';
import { AbilityFactory } from './application/ability.factory';
import { PermissionsGuard } from './infra/policies.guard';
import { MembershipModule } from '@modules/memberships/membership.module';
import { UsersModule } from '@modules/users/users.module';

/**
 * Permissions Module
 *
 * Registers CASL ability factory and guard as providers for
 * authorization throughout the application.
 * Imports Users and Memberships modules for role resolution from DB.
 */
@Module({
  imports: [MembershipModule, UsersModule],
  providers: [AbilityFactory, PermissionsGuard],
  exports: [AbilityFactory, PermissionsGuard],
})
export class PermissionsModule {}
