/**
 * T-092c: TechnicalSource_TE dual-FK validation
 *
 * Integration test: Controller → Service → Repository (mocked PrismaService)
 *
 * Scenarios:
 * 1. Create with sourceTypePlId only → succeeds
 * 2. Create with both null → throws
 * 3. Create with both set → throws
 */

import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TechnicalSource_TEController } from '@ingredients/technical-source-te.controller'
import { TechnicalSource_TEService } from '@ingredients/technical-source-te.service'
import {
  TechnicalSource_TE_Repository,
  PrismaTechnicalSource_TE_Repository,
} from '@ingredients/technical-source-te.repository'
import { createTenantContext } from '../../src/test-utils'

describe('T-092c: TechnicalSource_TE — dual-FK validation', () => {
  let controller: TechnicalSource_TEController
  let prismaMock: {
    technicalSource_TE: {
      findUnique: jest.Mock
      findMany: jest.Mock
      upsert: jest.Mock
      update: jest.Mock
    }
  }

  const tenantCtx = createTenantContext()
  const mockRequest = { context: tenantCtx } as any

  beforeEach(async () => {
    prismaMock = {
      technicalSource_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn().mockResolvedValue({}),
        update: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechnicalSource_TEController],
      providers: [
        TechnicalSource_TEService,
        PrismaTechnicalSource_TE_Repository,
        {
          provide: TechnicalSource_TE_Repository,
          useExisting: PrismaTechnicalSource_TE_Repository,
        },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    controller = module.get(TechnicalSource_TEController)
  })

  // ---------------------------------------------------------------
  // Success: sourceTypePlId only
  // ---------------------------------------------------------------
  it('should create TechnicalSource with sourceTypePlId only', async () => {
    // Arrange
    const dto = {
      sourceTypePlId: 'a1b2c3d4-e29b-41d4-a716-446655440000',
      sourceTypeTeId: null,
      referenceName: 'EU Regulation 1169/2011',
      url: 'https://example.gov/1169',
      documentRef: null,
      notes: null,
    }

    // Act
    const result = await controller.create(dto, mockRequest)

    // Assert — response DTO shape
    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.referenceName).toBe('EU Regulation 1169/2011')
    expect(result.sourceTypePlId).toBe(dto.sourceTypePlId)
    expect(result.sourceTypeTeId).toBeNull()

    // Assert — Prisma was called with the mapped persistence data
    expect(prismaMock.technicalSource_TE.upsert).toHaveBeenCalledTimes(1)
    const upsertCall = prismaMock.technicalSource_TE.upsert.mock.calls[0][0]
    expect(upsertCall.create).toMatchObject({
      referenceName: 'EU Regulation 1169/2011',
      sourceTypePlId: dto.sourceTypePlId,
      sourceTypeTeId: null,
      tenantId: tenantCtx.tenantId,
    })
  })

  // ---------------------------------------------------------------
  // Error: both null
  // ---------------------------------------------------------------
  it('should throw when both sourceTypePlId and sourceTypeTeId are null', async () => {
    // Arrange
    const dto = {
      sourceTypePlId: null,
      sourceTypeTeId: null,
      referenceName: 'Invalid source',
      url: null,
      documentRef: null,
      notes: null,
    }

    // Act & Assert — the entity layer throws because exactly one FK is required
    await expect(controller.create(dto, mockRequest)).rejects.toThrow(
      'TechnicalSource_TE must have exactly one source type',
    )

    // Assert — Prisma was never called
    expect(prismaMock.technicalSource_TE.upsert).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------
  // Error: both set
  // ---------------------------------------------------------------
  it('should throw when both sourceTypePlId and sourceTypeTeId are set', async () => {
    // Arrange
    const dto = {
      sourceTypePlId: 'a1b2c3d4-e29b-41d4-a716-446655440001',
      sourceTypeTeId: 'b2c3d4e5-e29b-41d4-a716-446655440002',
      referenceName: 'Ambiguous source',
      url: null,
      documentRef: null,
      notes: null,
    }

    // Act & Assert
    await expect(controller.create(dto, mockRequest)).rejects.toThrow(
      'TechnicalSource_TE must have exactly one source type',
    )

    // Assert — Prisma was never called
    expect(prismaMock.technicalSource_TE.upsert).not.toHaveBeenCalled()
  })
})
