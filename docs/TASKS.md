---
id: backend/TASKS
title: Backend Tasks Index
type: index
created: 2026-04-11
updated: 2026-04-19
tags:
  - tasks
  - backend
related:
  - EPICS
  - CONSTITUTION
---

# TASKS INDEX

<!--
## Execution Order (TASK_005_020 - TASK_005_038)

**Phase 1 - Foundation:**
- TASK_005_020 (Install) → 021 (Module) → 022 (Config) → 023 (Factory)

**Phase 2 - Subjects & Guards:**
- TASK_005_024 (Subjects) → 025 (Guard) → 026 (Decorator)

**Phase 3 - Hooks & Context (moved before controllers):**
- TASK_005_030 (Ownership Hooks) → 031 (Tenant Context)

**Phase 4 - Controllers:**
- TASK_005_027 (Users) → 028 (Memberships) → 029 (Tenants)

**Phase 5 - Cleanup:**
- TASK_005_032 (Deprecate) → 033 (Remove Decorator) → 034 (Remove Guard)

**Phase 6 - Testing:**
- TASK_005_035 (Unit Tests - depends on 023) → 036 (Integration) → 037 (Ownership Test)

**Phase 7 - Documentation:**
- TASK_005_038 (Docs)
-->

<!--
This file is derived from the canonical task files.
The source of truth is in each TASK_XXX.md.
Do not duplicate full task content here.
Links and IDs must match canonical filenames exactly.
-->

| Task ID      | Epic         | Name                                                  | Status  | Assignee | Priority | Link                   |
| ------------ | ------------ | ----------------------------------------------------- | ------- | -------- | -------- | ---------------------- |
| TASK_XXX_XXX | [[EPIC_001]] | Example Task                                          | backlog | dev      | high     | [[tasks/TASK_001]]     |
| TASK_005_001 | [[EPIC_005]] | Update PlatformRoles enum                             | backlog | dev      | high     | [[tasks/TASK_005_001]] |
| TASK_005_002 | [[EPIC_005]] | Add PlatformPermission and TenantPermission entities  | backlog | dev      | high     | [[tasks/TASK_005_002]] |
| TASK_005_003 | [[EPIC_005]] | Add Role entities to Prisma schema (PLATFORM and TENANT scoped) | backlog | dev      | high     | [[tasks/TASK_005_003]] |
| TASK_005_004 | [[EPIC_005]] | Update Membership model with roleId and tenantRoleType | backlog | dev      | high     | [[tasks/TASK_005_004]] |
| TASK_005_005 | [[EPIC_005]] | Create TenantRoleType enum                              | backlog | dev      | high     | [[tasks/TASK_005_005]] |
| TASK_005_006 | [[EPIC_005]] | Create PlatformPermission and TenantPermission domains| backlog | dev      | high     | [[tasks/TASK_005_006]] |
| TASK_005_007 | [[EPIC_005]] | Create Role domain entities (PLATFORM and TENANT scoped) | backlog | dev      | high    | [[tasks/TASK_005_007]] |
| TASK_005_008 | [[EPIC_005]] | Implement AuthorizationGuard (two-level)             | backlog | dev      | high     | [[tasks/TASK_005_008]] |
| TASK_005_009 | [[EPIC_005]] | Implement tenant-level permission verification       | backlog | dev      | high     | [[tasks/TASK_005_009]] |
| TASK_005_010 | [[EPIC_005]] | Create PermissionResolver (platform + tenant)       | backlog | dev      | high     | [[tasks/TASK_005_010]] |
| TASK_005_011 | [[EPIC_005]] | Separate Platform and Tenant Authorization Paths     | done    | dev      | high     | [[tasks/TASK_005_011]] |
| TASK_005_012 | [[EPIC_005]] | Seed platform and tenant permissions                 | backlog | dev      | high     | [[tasks/TASK_005_012]] |
| TASK_005_013 | [[EPIC_005]] | Seed platform and tenant role profiles                | backlog | dev      | high     | [[tasks/TASK_005_013]] |
| TASK_005_014 | [[EPIC_005]] | Unit tests for authorization                         | done    | dev      | high     | [[tasks/TASK_005_014]] |
| TASK_005_015 | [[EPIC_005]] | Implement @Require decorator for permissions          | done    | dev      | high     | [[tasks/TASK_005_015]] |
| TASK_005_016 | [[EPIC_005]] | Modify login.usecase.ts to support platform users   | done    | dev      | high     | [[tasks/TASK_005_016]] |
| TASK_005_017 | [[EPIC_005]] | Update LoginResponseDto with userType field          | done    | dev      | high     | [[tasks/TASK_005_017]] |
| TASK_005_018 | [[EPIC_005]] | Extend token.service.ts for platform token generation| done    | dev      | high     | [[tasks/TASK_005_018]] |
| TASK_005_019 | [[EPIC_005]] | Normalize ABAC authorization contract              | done    | dev      | high     | [[tasks/TASK_005_019]] |
| TASK_005_020 | [[EPIC_005]] | Install nest-casl package                      | backlog | dev      | critical | [[tasks/TASK_005_020]] |
| TASK_005_021 | [[EPIC_005]] | Configure CaslModule in app.module              | backlog | dev      | critical | [[tasks/TASK_005_021]] |
| TASK_005_022 | [[EPIC_005]] | Create permissions module configuration      | backlog | dev      | high     | [[tasks/TASK_005_022]] |
| TASK_005_023 | [[EPIC_005]] | Create AppAbilityFactory extending nest-casl | backlog | dev      | critical | [[tasks/TASK_005_023]] |
| TASK_005_024 | [[EPIC_005]] | Define custom subject classes with hooks     | backlog | dev      | high     | [[tasks/TASK_005_024]] |
| TASK_005_025 | [[EPIC_005]] | Replace with AccessGuard                    | backlog | dev      | high     | [[tasks/TASK_005_025]] |
| TASK_005_026 | [[EPIC_005]] | Replace @CheckPermissions with @UseAbility | backlog | dev      | high     | [[tasks/TASK_005_026]] |
| TASK_005_030 | [[EPIC_005]] | Implement ownership hooks                 | backlog | dev      | high     | [[tasks/TASK_005_030]] |
| TASK_005_031 | [[EPIC_005]] | Implement tenant conditions                | backlog | dev      | high     | [[tasks/TASK_005_031]] |
| TASK_005_027 | [[EPIC_005]] | Apply @UseAbility to UsersController         | backlog | dev      | high     | [[tasks/TASK_005_027]] |
| TASK_005_028 | [[EPIC_005]] | Apply @UseAbility to MembershipsController | backlog | dev      | high     | [[tasks/TASK_005_028]] |
| TASK_005_029 | [[EPIC_005]] | Apply @UseAbility to TenantsController     | backlog | dev      | high     | [[tasks/TASK_005_029]] |
| TASK_005_032 | [[EPIC_005]] | Deprecate old AbilityFactory              | backlog | dev      | medium   | [[tasks/TASK_005_032]] |
| TASK_005_033 | [[EPIC_005]] | Remove CheckPermissions decorator        | backlog | dev      | medium   | [[tasks/TASK_005_033]] |
| TASK_005_034 | [[EPIC_005]] | Remove custom PoliciesGuard               | backlog | dev      | medium   | [[tasks/TASK_005_034]] |
| TASK_005_035 | [[EPIC_005]] | Update unit tests                         | backlog | dev      | high     | [[tasks/TASK_005_035]] |
| TASK_005_036 | [[EPIC_005]] | Add integration tests                    | backlog | dev      | high     | [[tasks/TASK_005_036]] |
| TASK_005_037 | [[EPIC_005]] | Test ownership/isolation                  | backlog | dev      | high     | [[tasks/TASK_005_037]] |
| TASK_005_038 | [[EPIC_005]] | Update documentation                      | backlog | dev      | medium   | [[tasks/TASK_005_038]] |
| TASK_005_039 | [[EPIC_005]] | Fresh install smoke test                 | backlog | dev      | medium   | [[tasks/TASK_005_039]] |