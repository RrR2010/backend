---
id: backend/TASKS
title: Backend Tasks Index
type: index
created: 2026-04-11
updated: 2026-04-16
tags:
  - tasks
  - backend
related:
  - EPICS
  - CONSTITUTION
---

# TASKS INDEX

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
| TASK_005_011 | [[EPIC_005]] | Apply authorization guards to controllers            | backlog | dev      | high     | [[tasks/TASK_005_011]] |
| TASK_005_012 | [[EPIC_005]] | Seed platform and tenant permissions                 | backlog | dev      | high     | [[tasks/TASK_005_012]] |
| TASK_005_013 | [[EPIC_005]] | Seed platform and tenant role profiles                | backlog | dev      | high     | [[tasks/TASK_005_013]] |
| TASK_005_014 | [[EPIC_005]] | Unit tests for authorization                         | backlog | dev      | high     | [[tasks/TASK_005_014]] |
| TASK_005_015 | [[EPIC_005]] | Implement @Require decorator for permissions          | backlog | dev      | high     | [[tasks/TASK_005_015]] |
| TASK_005_016 | [[EPIC_005]] | Modify login.usecase.ts to support platform users   | backlog | dev      | high     | [[tasks/TASK_005_016]] |
| TASK_005_017 | [[EPIC_005]] | Update LoginResponseDto with userType field          | backlog | dev      | high     | [[tasks/TASK_005_017]] |
| TASK_005_018 | [[EPIC_005]] | Extend token.service.ts for platform token generation| backlog | dev      | high     | [[tasks/TASK_005_018]] |
| TASK_005_019 | [[EPIC_005]] | Implement select-tenant auto-selection logic         | backlog | dev      | high     | [[tasks/TASK_005_019]] |
| TASK_005_020 | [[EPIC_005]] | Update JWT strategy to handle both token types      | backlog | dev      | high     | [[tasks/TASK_005_020]] |
| TASK_005_021 | [[EPIC_005]] | Implement platform-scoped authorization guard        | backlog | dev      | high     | [[tasks/TASK_005_021]] |
| TASK_005_022 | [[EPIC_005]] | Update tenant-scoped guard for unified token support| backlog | dev      | high     | [[tasks/TASK_005_022]] |
| TASK_005_023 | [[EPIC_005]] | Integration testing for unified auth flow           | backlog | dev      | high     | [[tasks/TASK_005_023]] |