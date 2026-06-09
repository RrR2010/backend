import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.dev' })

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import supertest from 'supertest'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '@shared/prisma/prisma.service'
import {
  createTestRegistrationDto,
  createFakeWebhookPayload,
  createFakeWebhookHeaders
} from '../helpers/bootstrap.helper'

async function waitForProvisioned(
  app: INestApplication,
  registrationId: string,
  timeoutMs = 5000
): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const res = await supertest(app.getHttpServer())
      .get(`/bootstrap/status/${registrationId}`)
      .expect(200)

    if (res.body.state === 'PROVISIONED') return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(
    `Timed out waiting for PROVISIONED state after ${timeoutMs}ms`
  )
}

describe('Bootstrap E2E (Phase 7)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    prisma = moduleFixture.get<PrismaService>(PrismaService)
  })

  afterAll(async () => {
    await app.close()
  })

  afterEach(async () => {
    await prisma.$executeRawUnsafe(`
      DELETE FROM "AuditLog"
    `)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "MemberProfileDocument"
    `)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "MemberProfile"
    `)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "TenantMembership"
    `)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "PlatformMembership"
    `)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "Identity"
    `)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "Session"
    `)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "TenantSite"
    `)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "Tenant"
    `)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "User"
    `)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "TenantRegistration"
    `)
  })

  // --------------- Task 64: Fake Provider Flow ---------------

  describe('Fake provider flow', () => {
    it('should register, fake approve, verify PROVISIONED, and claim session', async () => {
      // 1. Register
      const dto = createTestRegistrationDto()
      const registerRes = await supertest(app.getHttpServer())
        .post('/bootstrap/register')
        .send(dto)
        .expect(201)

      const { registrationId, paymentUrl } = registerRes.body
      const handoffToken = registerRes.headers['x-handoff-token'] as string

      expect(registrationId).toBeDefined()
      expect(paymentUrl).toContain('fake-approve')
      expect(handoffToken).toBeDefined()

      // 2. Verify initial status is PENDING
      const statusRes = await supertest(app.getHttpServer())
        .get(`/bootstrap/status/${registrationId}`)
        .expect(200)
      expect(statusRes.body.state).toBe('PENDING')

      // 3. Fake approve
      await supertest(app.getHttpServer())
        .post(`/bootstrap/fake-approve/${registrationId}`)
        .expect(200)

      // 4. Verify status is PROVISIONED
      await waitForProvisioned(app, registrationId)

      const approvedStatusRes = await supertest(app.getHttpServer())
        .get(`/bootstrap/status/${registrationId}`)
        .expect(200)
      expect(approvedStatusRes.body.state).toBe('PROVISIONED')

      // 5. Claim session
      const claimRes = await supertest(app.getHttpServer())
        .post('/bootstrap/claim-session')
        .send({ registrationId, handoffToken })
        .expect(200)

      expect(claimRes.body.user).toBeDefined()
      expect(claimRes.body.tenant).toBeDefined()
      expect(claimRes.body.nextStepHint).toBe('direct-login')

      // Verify cookies are set
      const setCookie = claimRes.headers['set-cookie'] as string[] | undefined
      expect(setCookie).toBeDefined()
      expect(setCookie!.some((c) => c.includes('access'))).toBe(true)
      expect(setCookie!.some((c) => c.includes('refresh'))).toBe(true)
    })
  })

  // --------------- Task 65: Webhook Simulation ---------------

  describe('Webhook simulation', () => {
    it('should trigger provisioning when webhook sends approved status', async () => {
      // 1. Register
      const dto = createTestRegistrationDto()
      const registerRes = await supertest(app.getHttpServer())
        .post('/bootstrap/register')
        .send(dto)
        .expect(201)

      const { registrationId } = registerRes.body
      const externalRef = registerRes.body.registrationId // externalRef is the registrationId

      // 2. Send webhook with approved status
      const webhookPayload = createFakeWebhookPayload(externalRef, 'approved')
      const headers = createFakeWebhookHeaders()

      await supertest(app.getHttpServer())
        .post('/bootstrap/webhook/payment')
        .send(webhookPayload)
        .set(headers)
        .expect(200)

      // 3. Verify provisioning triggered
      await waitForProvisioned(app, registrationId)

      const statusRes = await supertest(app.getHttpServer())
        .get(`/bootstrap/status/${registrationId}`)
        .expect(200)
      expect(statusRes.body.state).toBe('PROVISIONED')
    })

    it('should handle duplicate webhook deliveries idempotently', async () => {
      // 1. Register
      const dto = createTestRegistrationDto()
      const registerRes = await supertest(app.getHttpServer())
        .post('/bootstrap/register')
        .send(dto)
        .expect(201)

      const { registrationId } = registerRes.body
      const externalRef = registrationId

      // 2. Send webhook twice with same approved status
      const webhookPayload = createFakeWebhookPayload(externalRef, 'approved')
      const headers = createFakeWebhookHeaders()

      await supertest(app.getHttpServer())
        .post('/bootstrap/webhook/payment')
        .send(webhookPayload)
        .set(headers)
        .expect(200)

      await supertest(app.getHttpServer())
        .post('/bootstrap/webhook/payment')
        .send(webhookPayload)
        .set(headers)
        .expect(200)

      // 3. Verify still PROVISIONED (not duplicated)
      await waitForProvisioned(app, registrationId)

      const statusRes = await supertest(app.getHttpServer())
        .get(`/bootstrap/status/${registrationId}`)
        .expect(200)
      expect(statusRes.body.state).toBe('PROVISIONED')
    })
  })

  // --------------- Task 66: Duplicate Submission Protection ---------------

  describe('Duplicate submission protection', () => {
    it('should reject registration with duplicate email (409)', async () => {
      const dto = createTestRegistrationDto()

      // First registration succeeds
      await supertest(app.getHttpServer())
        .post('/bootstrap/register')
        .send(dto)
        .expect(201)

      // Second registration with same email fails
      const duplicateDto = createTestRegistrationDto({ email: dto.email })
      await supertest(app.getHttpServer())
        .post('/bootstrap/register')
        .send(duplicateDto)
        .expect(409)
    })

    it('should reject registration with duplicate tax ID (409)', async () => {
      const dto = createTestRegistrationDto()

      // First registration succeeds
      await supertest(app.getHttpServer())
        .post('/bootstrap/register')
        .send(dto)
        .expect(201)

      // Second registration with same tax ID fails
      const duplicateDto = createTestRegistrationDto({
        tenantSiteTaxId: dto.tenantSiteTaxId
      })
      await supertest(app.getHttpServer())
        .post('/bootstrap/register')
        .send(duplicateDto)
        .expect(409)
    })
  })

  // --------------- Task 67: Token Reuse Rejection ---------------

  describe('Token reuse rejection', () => {
    it('should reject second claim with the same handoff token (401)', async () => {
      // 1. Register and approve
      const dto = createTestRegistrationDto()
      const registerRes = await supertest(app.getHttpServer())
        .post('/bootstrap/register')
        .send(dto)
        .expect(201)

      const { registrationId } = registerRes.body
      const handoffToken = registerRes.headers['x-handoff-token'] as string

      // 2. Fake approve
      await supertest(app.getHttpServer())
        .post(`/bootstrap/fake-approve/${registrationId}`)
        .expect(200)

      await waitForProvisioned(app, registrationId)

      // 3. First claim succeeds
      await supertest(app.getHttpServer())
        .post('/bootstrap/claim-session')
        .send({ registrationId, handoffToken })
        .expect(200)

      // 4. Second claim with same token fails
      await supertest(app.getHttpServer())
        .post('/bootstrap/claim-session')
        .send({ registrationId, handoffToken })
        .expect(401)
    })
  })

  // --------------- Task 68: Expired Registration Rejection ---------------

  describe('Expired registration rejection', () => {
    it('should return EXPIRED status when registration is past expiresAt', async () => {
      // 1. Create a registration directly in DB with past expiresAt
      const dto = createTestRegistrationDto()
      const registerRes = await supertest(app.getHttpServer())
        .post('/bootstrap/register')
        .send(dto)
        .expect(201)

      const { registrationId } = registerRes.body

      // 2. Manually set expiresAt to the past
      await prisma.tenantRegistration.update({
        where: { id: registrationId },
        data: { expiresAt: new Date(Date.now() - 60 * 1000) } // 1 minute ago
      })

      // 3. Poll status — should detect expiry
      const statusRes = await supertest(app.getHttpServer())
        .get(`/bootstrap/status/${registrationId}`)
        .expect(200)

      expect(statusRes.body.state).toBe('EXPIRED')
    })

    it('should reject claim-session for an expired registration', async () => {
      // 1. Create a registration
      const dto = createTestRegistrationDto()
      const registerRes = await supertest(app.getHttpServer())
        .post('/bootstrap/register')
        .send(dto)
        .expect(201)

      const { registrationId } = registerRes.body
      const handoffToken = registerRes.headers['x-handoff-token'] as string

      // 2. Set expiresAt to past and state to PENDING
      await prisma.tenantRegistration.update({
        where: { id: registrationId },
        data: {
          expiresAt: new Date(Date.now() - 60 * 1000),
          state: 'PENDING'
        }
      })

      // 3. Try to claim — should fail because state is not PROVISIONED
      await supertest(app.getHttpServer())
        .post('/bootstrap/claim-session')
        .send({ registrationId, handoffToken })
        .expect(409)
    })
  })

  // --------------- Finding 7: Negative tests for fake approval ---------------

  describe('Fake approval negative tests', () => {
    it('should return 404 for non-existent registration', async () => {
      await supertest(app.getHttpServer())
        .post('/bootstrap/fake-approve/non-existent-id')
        .expect(404)
    })

    it('should return 409 for already processed registration', async () => {
      // First, register and approve
      const registerRes = await supertest(app.getHttpServer())
        .post('/bootstrap/register')
        .send(createTestRegistrationDto())
        .expect(201)

      const registrationId = registerRes.body.registrationId

      await supertest(app.getHttpServer())
        .post(`/bootstrap/fake-approve/${registrationId}`)
        .expect(200)

      await waitForProvisioned(app, registrationId)

      // Second approval should fail (state is now PROVISIONED)
      await supertest(app.getHttpServer())
        .post(`/bootstrap/fake-approve/${registrationId}`)
        .expect(409)
    })
  })
})
