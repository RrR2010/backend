/**
 * Permissions Module
 *
 * Module for CASL-based authorization system.
 * Provides ability factory for creating permissions based on roles.
 */
import { Module } from '@nestjs/common';
import { AbilityFactory } from './application/ability.factory';

/**
 * Permissions Module
 *
 * Registers CASL ability factory as a provider for
 * authorization throughout the application.
 */
@Module({
  providers: [AbilityFactory],
  exports: [AbilityFactory],
})
export class PermissionsModule {}
