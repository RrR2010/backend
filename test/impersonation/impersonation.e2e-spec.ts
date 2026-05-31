import 'dotenv/config'

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import supertest from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { Prisma } from '@prisma/client'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '@shared/prisma/prisma.service'
import { PlatformRole, TenantRole, UserScope } from '@users/user.types'

/**
 * Signs a JWT token with the given payload for testing.
 * Uses the same secret as the application (JWT_SECRET || 'secret').
 */
function signTestToken(
  jwtService: JwtService,
  payload: Record<string, unknown>
): string {
  return jwtService.sign(payload)
}

describe('Tenant Impersonation E2E (EPIC_010)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwtService: JwtService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    prisma = moduleFixture.get<PrismaService>(PrismaService)
    jwtService = moduleFixture.get<JwtService>(JwtService)
  })

  afterAll(async () => {
    await app.close()
  })

  afterEach(async () => {
    // Clean up in reverse dependency order
    await prisma.$executeRawUnsafe(`DELETE FROM "IngredientTenantNutrient"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "TenantNutrient"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "IngredientBaseAllergen"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "BaseAllergen"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "SubscriptionEvent"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "Subscription"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "AuditLog"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "TenantMembership"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "PlatformMembership"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "Session"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "Identity"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "TenantSite"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "Tenant"`)
    await prisma.$executeRawUnsafe(`DELETE FROM "User"`)
  })

  // ========= Helper: Create test tenant with subscription =========
  async function createTestTenant(
    overrides: { id?: string; subscriptionStatus?: string } = {}
  ): Promise<string> {
    const tenantId = overrides.id ?? crypto.randomUUID()
    await prisma.tenant.create({
      data: {
        id: tenantId,
        name: 'Test Tenant ' + tenantId.slice(0, 8),
        slug: null,
        website: null,
        locale: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        logoUrl: null,
        settings: Prisma.JsonNull,
        systemState: 'ACTIVE',
      },
    })

    await prisma.subscription.create({
      data: {
        id: crypto.randomUUID(),
        tenantId,
        planType: 'BASIC',
        status: overrides.subscriptionStatus ?? 'ACTIVE',
        currency: 'BRL',
        provider: 'mercadopago',
        providerSubscriptionId: 'sub-' + crypto.randomUUID(),
        basePriceSnapshot: 5000,
        includedUsersSnapshot: 3,
        currentAmount: 5000,
      },
    })

    return tenantId
  }

  // ========= Helper: Create PLATFORM user =========
  async function createPlatformUser(
    userId: string,
    roles: PlatformRole[]
  ): Promise<void> {
    await prisma.user.create({
      data: {
        id: userId,
        scope: 'PLATFORM',
        systemState: 'ACTIVE',
      },
    })

    await prisma.platformMembership.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        roles,
        systemState: 'ACTIVE',
      },
    })
  }

  // ========= Helper: Create TENANT user =========
  async function createTenantUser(
    userId: string,
    tenantId: string,
    roles: TenantRole[]
  ): Promise<void> {
    await prisma.user.create({
      data: {
        id: userId,
        scope: 'TENANT',
        systemState: 'ACTIVE',
      },
    })

    await prisma.tenantMembership.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        tenantId,
        isOwner: true,
        roles,
        systemState: 'ACTIVE',
      },
    })
  }

  // ================================================================
  // Test: PLATFORM ADMIN can impersonate and create tenant-nutrient
  // ================================================================
  it('should allow PLATFORM ADMIN to impersonate and create tenant-nutrient', async () => {
    const adminUserId = crypto.randomUUID()
    const targetTenantId = await createTestTenant()
    await createPlatformUser(adminUserId, [PlatformRole.ADMIN])

    const token = signTestToken(jwtService, {
      type: 'auth',
      userId: adminUserId,
      scope: 'PLATFORM',
      roles: [PlatformRole.ADMIN],
      tenantId: null,
    })

    const res = await supertest(app.getHttpServer())
      .post('/tenant-nutrients')
      .set('Cookie', `accessToken=${token}`)
      .set('X-Tenant-Id', targetTenantId)
      .send({
        tenantId: targetTenantId,
        name: 'E2E Test Nutrient',
        unit: 'G',
        category: 'OTHER',
        sortOrder: 0,
        isActive: true,
      })
      .expect(201)

    expect(res.body).toBeDefined()
    expect(res.body.tenantId).toBe(targetTenantId)
    expect(res.body.name).toBe('E2E Test Nutrient')

    // Verify it's actually persisted under the impersonated tenant
    const dbNutrient = await prisma.tenantNutrient.findUnique({
      where: { id: res.body.id },
    })
    expect(dbNutrient).not.toBeNull()
    expect(dbNutrient!.tenantId).toBe(targetTenantId)
  })

  // ================================================================
  // Test: PLATFORM USER (non-admin) cannot impersonate
  // ================================================================
  it('should reject impersonation by PLATFORM USER (non-admin)', async () => {
    const regularUserId = crypto.randomUUID()
    const targetTenantId = await createTestTenant()
    await createPlatformUser(regularUserId, [PlatformRole.USER])

    const token = signTestToken(jwtService, {
      type: 'auth',
      userId: regularUserId,
      scope: 'PLATFORM',
      roles: [PlatformRole.USER],
      tenantId: null,
    })

    await supertest(app.getHttpServer())
      .post('/tenant-nutrients')
      .set('Cookie', `accessToken=${token}`)
      .set('X-Tenant-Id', targetTenantId)
      .send({
        tenantId: targetTenantId,
        name: 'Should Fail',
        unit: 'G',
        category: 'OTHER',
      })
      .expect(403)
  })

  // ================================================================
  // Test: TENANT user's X-Tenant-Id is ignored
  // ================================================================
  it('should ignore X-Tenant-Id for TENANT users', async () => {
    const tenantUserId = crypto.randomUUID()
    const realTenantId = await createTestTenant()
    const differentTenantId = await createTestTenant()
    await createTenantUser(tenantUserId, realTenantId, [TenantRole.USER])

    const token = signTestToken(jwtService, {
      type: 'auth',
      userId: tenantUserId,
      scope: 'TENANT',
      roles: [TenantRole.USER],
      tenantId: realTenantId,
    })

    // Send request with a DIFFERENT X-Tenant-Id than the user's real tenant
    const res = await supertest(app.getHttpServer())
      .post('/tenant-nutrients')
      .set('Cookie', `accessToken=${token}`)
      .set('X-Tenant-Id', differentTenantId)
      .send({
        tenantId: realTenantId,
        name: 'Tenant User Nutrient',
        unit: 'MG',
        category: 'MINERALS',
        sortOrder: 0,
        isActive: true,
      })
      .expect(201)

    // The nutrient should be created under the user's REAL tenant (from JWT),
    // not the one in X-Tenant-Id header
    expect(res.body).toBeDefined()
    expect(res.body.tenantId).toBe(realTenantId)
  })

  // ================================================================
  // Test: Non-existent tenant returns 404
  // ================================================================
  it('should return 404 for non-existent tenant impersonation', async () => {
    const adminUserId = crypto.randomUUID()
    await createPlatformUser(adminUserId, [PlatformRole.ADMIN])

    const token = signTestToken(jwtService, {
      type: 'auth',
      userId: adminUserId,
      scope: 'PLATFORM',
      roles: [PlatformRole.ADMIN],
      tenantId: null,
    })

    await supertest(app.getHttpServer())
      .post('/tenant-nutrients')
      .set('Cookie', `accessToken=${token}`)
      .set('X-Tenant-Id', 'non-existent-tenant-id')
      .send({
        tenantId: 'non-existent-tenant-id',
        name: 'Should Fail',
        unit: 'G',
        category: 'OTHER',
      })
      .expect(404)
  })

  // ================================================================
  // Test: Expired subscription returns 403
  // ================================================================
  it('should return 403 for expired subscription impersonation', async () => {
    const adminUserId = crypto.randomUUID()
    const expiredTenantId = await createTestTenant({
      subscriptionStatus: 'EXPIRED',
    })
    await createPlatformUser(adminUserId, [PlatformRole.ADMIN])

    const token = signTestToken(jwtService, {
      type: 'auth',
      userId: adminUserId,
      scope: 'PLATFORM',
      roles: [PlatformRole.ADMIN],
      tenantId: null,
    })

    await supertest(app.getHttpServer())
      .post('/tenant-nutrients')
      .set('Cookie', `accessToken=${token}`)
      .set('X-Tenant-Id', expiredTenantId)
      .send({
        tenantId: expiredTenantId,
        name: 'Should Fail',
        unit: 'G',
        category: 'OTHER',
      })
      .expect(403)
  })

  // ================================================================
  // Test: CANCELED subscription returns 403
  // ================================================================
  it('should return 403 for CANCELED subscription impersonation', async () => {
    const adminUserId = crypto.randomUUID()
    const canceledTenantId = await createTestTenant({
      subscriptionStatus: 'CANCELED',
    })
    await createPlatformUser(adminUserId, [PlatformRole.ADMIN])

    const token = signTestToken(jwtService, {
      type: 'auth',
      userId: adminUserId,
      scope: 'PLATFORM',
      roles: [PlatformRole.ADMIN],
      tenantId: null,
    })

    await supertest(app.getHttpServer())
      .post('/tenant-nutrients')
      .set('Cookie', `accessToken=${token}`)
      .set('X-Tenant-Id', canceledTenantId)
      .send({
        tenantId: canceledTenantId,
        name: 'Should Fail',
        unit: 'G',
        category: 'OTHER',
      })
      .expect(403)
  })

  // ================================================================
  // Test: PAST_DUE subscription returns 403
  // ================================================================
  it('should return 403 for PAST_DUE subscription', async () => {
    const adminUserId = crypto.randomUUID()
    const pastDueTenantId = await createTestTenant({
      subscriptionStatus: 'PAST_DUE',
    })
    await createPlatformUser(adminUserId, [PlatformRole.ADMIN])

    const token = signTestToken(jwtService, {
      type: 'auth',
      userId: adminUserId,
      scope: 'PLATFORM',
      roles: [PlatformRole.ADMIN],
      tenantId: null,
    })

    await supertest(app.getHttpServer())
      .post('/tenant-nutrients')
      .set('Cookie', `accessToken=${token}`)
      .set('X-Tenant-Id', pastDueTenantId)
      .send({
        tenantId: pastDueTenantId,
        name: 'Should Fail',
        unit: 'G',
        category: 'OTHER',
      })
      .expect(403)
  })

  // ================================================================
  // Test: Platform-scoped entity still accessible during impersonation
  // ================================================================
  it('should still allow PLATFORM ADMIN to access platform-scoped entities during impersonation', async () => {
    const adminUserId = crypto.randomUUID()
    const targetTenantId = await createTestTenant()
    await createPlatformUser(adminUserId, [PlatformRole.ADMIN])

    // First create a base allergen (platform-scoped)
    const token = signTestToken(jwtService, {
      type: 'auth',
      userId: adminUserId,
      scope: 'PLATFORM',
      roles: [PlatformRole.ADMIN],
      tenantId: null,
    })

    const baseAllergenName =
      'E2E Test Base Allergen During Impersonation ' +
      crypto.randomUUID().slice(0, 8)

    // Create base allergen while impersonating
    const res = await supertest(app.getHttpServer())
      .post('/base-allergens')
      .set('Cookie', `accessToken=${token}`)
      .set('X-Tenant-Id', targetTenantId)
      .send({
        name: baseAllergenName,
        category: 'CEREAIS',
        sortOrder: 1,
      })
      .expect(201)

    expect(res.body).toBeDefined()
    expect(res.body.name).toBe(baseAllergenName)
    // BaseAllergen is platform-scoped — no tenantId expected
    expect(res.body).not.toHaveProperty('tenantId')

    // Verify it's in the DB under no specific tenant
    const dbAllergen = await prisma.baseAllergen.findUnique({
      where: { id: res.body.id },
    })
    expect(dbAllergen).not.toBeNull()
  })
})
