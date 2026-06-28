# Viver Sorvete API

NestJS backend for the Viver Sorvete ice cream shop management platform — a multi-tenant SaaS system with ABAC authorization, subscription billing, and a full ingredient compliance domain.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | [NestJS 11](https://nestjs.com/) |
| Language | TypeScript 5.7 (strict mode, `noUncheckedIndexedAccess`) |
| ORM | [Prisma 7](https://prisma.io/) with PostgreSQL |
| Auth | JWT (Passport) + refresh token rotation |
| Authorization | [CASL](https://casl.js.org/) ABAC via `nest-casl` |
| Validation | `class-validator` + `class-transformer` |
| API Docs | Swagger (`/api`) |
| Testing | Jest (unit + e2e) |
| Payments | Mercado Pago (with fake provider for dev) |

## Prerequisites

- Node.js 22+
- PostgreSQL 16+
- npm

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.dev .env
# Edit .env with your DATABASE_URL, secrets, etc.

# 3. Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# 4. Seed plans (for subscription system)
npx ts-node prisma/seed-plans.ts

# 5. Start dev server (watch mode)
npm run dev
```

The server starts at `http://localhost:3001` by default.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start in watch mode (uses `.env.dev`) |
| `npm run build` | Production build |
| `npm run start:prod` | Run production build |
| `npm run lint` | ESLint + Prettier |
| `npm run test` | Unit tests |
| `npm run test:watch` | Watch mode |
| `npm run test:cov` | Coverage report |
| `npm run test:e2e` | End-to-end tests |
| `npm run format` | Prettier formatting |

## Architecture

### Module Structure

```
src/
├── main.ts                       # Bootstrap + Swagger + CORS
├── app.module.ts                 # Root module (imports all modules)
├── shared/                       # Shared primitives
│   ├── base-entity.ts            # Base entity interface
│   ├── behaviours/               # Lockable, Auditable mixins
│   ├── enums.ts / types.ts       # Global types
│   ├── value-objects.ts          # Value objects
│   ├── errors/                   # Reusable error classes
│   ├── decorators/               # Custom decorators
│   ├── interceptors/             # Request context interceptor
│   └── prisma/                   # PrismaModule + PrismaService
├── modules/
│   ├── authentication/           # JWT auth, sessions, login/refresh
│   ├── authorization/            # ABAC policies, guard, CASL setup
│   ├── users/                    # User domain
│   ├── tenants/                  # Tenant domain
│   ├── identities/               # Auth provider identities (email, CPF)
│   ├── platform-memberships/     # Platform-level memberships
│   ├── tenant-memberships/       # Tenant-level memberships
│   ├── member-profiles/          # Member profile (personal data)
│   ├── member-profile-documents/ # Documents (CPF, CNPJ, RG, etc.)
│   ├── addresses/                # Polymorphic addresses
│   ├── phones/                   # Polymorphic phones
│   ├── tenant-sites/             # Tenant facilities (factory, warehouse, office)
│   ├── audit-logs/               # Auditing for entity changes
│   ├── bootstrap/                # Tenant self-registration flow
│   ├── payments/                 # Payment abstraction (Mercado Pago / fake)
│   ├── billing/                  # Plans, subscriptions, lifecycle
│   ├── admin/                    # Platform admin endpoints
│   └── ingredients/              # Full ingredient compliance domain
│       ├── base-allergen.*       # Platform-scoped allergen catalog
│       ├── base-nutrient.*       # Platform-scoped nutrient catalog
│       ├── allergen.*            # Tenant-scoped allergens
│       ├── nutrient.*            # Tenant-scoped nutrients
│       ├── functional-group.*    # Functional groups
│       ├── company.*             # Manufacturers / suppliers
│       ├── technical-info-source.* # Technical references
│       ├── ingredient.*          # Ingredient master
│       ├── ingredient-allergen.* # Allergen declarations
│       ├── ingredient-nutrient.* # Nutritional declarations
│       ├── ingredient-regulatory-profile.*  # GMO, irradiation, etc.
│       ├── ingredient-labeling-profile.*    # Front-of-pack labeling
│       └── ingredient-technical-profile.*   # Technical specs (PAC, POD, solids)
└── test/                         # E2E tests
```

### Domain Pattern

Each module follows a consistent layered architecture:

```
controller.ts  →  service.ts  →  repository.ts  →  Prisma
     ↕                ↕
   dto.ts          entity.ts
```

- **Controller** — HTTP routes, validation, Swagger decorators
- **Service** — Business logic, authorization checks
- **Repository** — Data access via Prisma
- **Entity** — Domain model with mixins (`Auditable`, `Lockable`)
- **DTO** — Request/response types with `class-validator`

### Shared Behaviours

Entities use composable mixins:

- `Auditable(Base)` — Adds `createdAt`, `updatedAt`, `systemState`
- `Lockable(Auditable(Base))` — Adds `activate()`, `lock()`, `unlock()`, `ensureActivated()` guards

## Authentication

- JWT-based with refresh token rotation (opaque hashed refresh tokens)
- Two scopes: `PLATFORM` and `TENANT`
- Login returns `accessToken` + `refreshToken` (httpOnly cookie)
- Token refresh extends session, old refresh tokens are revoked
- Session management: list and revoke sessions per user

## Authorization (ABAC)

**Attribute-Based Access Control** via CASL:

- **Platform Admins** — Full control over platform-scoped resources (`Manage` action on `all`)
- **Platform Users** — Limited platform access
- **Tenant Admins** — Manage within their tenant (`Manage` on tenant-scoped resources)
- **Tenant Users** — Read + limited write within their tenant

All controllers use `@Authorize(Action.Manage, Subject)` to declare required permissions.
The `AuthorizationGuard` (global, fail-closed) enforces these rules.

## Ingredient Domain

The ingredient compliance module manages:

| Entity | Scope | Purpose |
|--------|-------|---------|
| BaseAllergen / BaseNutrient | Platform | Reference catalogs seeded by platform admin |
| Allergen / Nutrient | Tenant | Tenant-specific catalogs copied/cloned from base |
| FunctionalGroup | Tenant | Ingredient categorization |
| Company | Tenant | Manufacturers and suppliers |
| TechnicalInfoSource | Tenant | Datasheets, IBGE tables, lab reports |
| Ingredient | Tenant | Master ingredient record |
| IngredientRegulatoryProfile | Tenant | GMO, irradiation, lactose, gluten, aspartame |
| IngredientLabelingProfile | Tenant | Added sugars, fats, front-of-pack declarations |
| IngredientTechnicalProfile | Tenant | PAC, POD, total solids, ash content |

All entities support **soft-delete** via `systemState` (`ACTIVE` / `LOCKED` / `DELETED`).

## Billing & Subscription

- Plan-based subscription system (Free / Basic / Premium / Enterprise)
- Mercado Pago integration (sandbox by default; fake provider for dev)
- Full lifecycle: trial → active → past_due → grace → paused → canceled → expired
- Seat-based pricing (included + additional users)
- Webhook handling for payment events

## Bootstrap (Tenant Registration)

Self-service tenant registration flow:
1. Tenant fills registration form → creates `TenantRegistration` with `PENDING` state
2. Payment (Mercado Pago) → transitions to `APPROVED`
3. Provisioning → creates tenant, admin user, identity, profile, site, subscription
4. Handoff token → used for first login

## API Documentation

Swagger UI available at `http://localhost:3001/api` when the server is running.

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | Login with email/CPF |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Logout (revoke session) |
| `GET` | `/auth/me` | Current user info |
| `GET` | `/auth/sessions` | List active sessions |
| `DELETE` | `/auth/sessions/:id` | Revoke a session |
| `POST` | `/admin/bootstrap` | Platform admin (one-time) |
| `GET` | `/base-allergens` | List base allergens (platform catalog) |
| `GET` | `/base-nutrients` | List base nutrients (platform catalog) |
| `GET` | `/ingredients` | List tenant ingredients |
| `POST` | `/ingredients` | Create ingredient |
| `POST` | `/ingredients/:id/save` | Save all ingredient profiles atomically |
| `POST` | `/bootstrap/register` | Start tenant registration |
| `GET` | `/plans` | List available plans |
| `GET` | `/subscription` | Get current subscription |

## Database

- **Dev**: PostgreSQL via Docker (`docker compose up -d`)
- **Prod**: PostgreSQL (connection string via `DATABASE_URL`)
- Schema management: `prisma db push` for dev (no migration history)
- Seed plans: `npx ts-node prisma/seed-plans.ts`

## Conventions

- **Path aliases**: All imports use `@module/path` aliases (no relative imports across modules)
- **Repository context**: Every service/repository method receives `ctx: RequestContext` for tenant filtering
- **Error handling**: Custom domain errors in `*.errors.ts` files per module
- **Consistency**: All entities have `systemState`, `createdAt`, `updatedAt` via mixins
