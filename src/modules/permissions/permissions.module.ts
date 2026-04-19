/**
 * Permissions Module
 *
 * Module for CASL-based authorization system.
 * Provides ability factory for creating permissions based on roles.
 */
import { Module } from '@nestjs/common';
import { AbilityFactory } from './application/ability.factory';
import { PermissionsGuard } from './infra/policies.guard';

/**
 * Permissions Module
 *
 * Registers CASL ability factory and guard as providers for
 * authorization throughout the application.
 */
@Module({
  providers: [AbilityFactory, PermissionsGuard],
  exports: [AbilityFactory, PermissionsGuard],
})
export class PermissionsModule {}
