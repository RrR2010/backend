# ABAC Contract - Authorization Vocabulary

## 1. Canonical Actions

| Action | Definition |
|--------|------------|
| Manage | Full control: includes Create, Read, Update, Delete |
| Create | Create new entity instances |
| Read | View entity details |
| Update | Modify existing entities |
| Delete | Remove entities |

## 2. Subjects

| Subject | Entity | Primary Key |
|---------|--------|------------|
| User | User entity | userId |
| Tenant | Tenant entity | tenantId |
| Membership | User-Tenant association | membershipId |

## 3. Scopes

| Scope | Definition | Role Source |
|-------|------------|------------|
| platform | Global (all tenants) | PlatformRole on User |
| tenant | Per-tenant isolation | TenantRole on Membership |

## 4. Conditions

- Ownership check: resource.tenantId === user.tenantId

## 5. Policy Evaluation

- Permissions resolved from roles via AbilityFactory
- Deny-by-default (no explicit allow = deny)
- Scope determined by token: tenantId present → tenant; absent → platform

## 6. Implementation

- CASL-based AbilityFactory
- PermissionsGuard (fail-safe)
- Token: sub, tenantId only (roles resolved server-side)