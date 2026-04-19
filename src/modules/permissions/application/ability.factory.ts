/**
 * Ability Factory
 *
 * PLACEHOLDER - This file is intentionally left empty/commented.
 *
 * This is a placeholder for TASK_005_008 which will implement
 * the CASL-based authorization system.
 *
 * The implementation will:
 * - Use @casl/ability for permission management
 * - Create ability for Membership entities based on TenantRole
 * - Define platform-level and tenant-level permissions
 *
 * Related:
 * - PlatformRole (platform-wide permissions)
 * - TenantRole (tenant-specific permissions)
 * - TASK_005_008
 */

// import { AbilityBuilder, PureAbility, createMongoAbility } from '@casl/ability';
// import { Injectable } from '@nestjs/common';
// import {
//   Membership,
//   Role,
// } from '@modules/memberships/domain/membership.entity';

// export type AppAbility = PureAbility<[string, string]>;

// @Injectable
// export class AbilityFactory {
//   createForMembership(membership: Membership): AppAbility {
//     const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
//   }
// }
