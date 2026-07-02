/**
 * T-092d: Product_TE with children
 *
 * Integration test: Controller → Service → Repository (mocked PrismaService)
 *
 * Scenarios:
 * 1. Create Product_TE via controller
 * 2. Add ProductLabelField_TE and ProductPanel_TE via their services
 * 3. Verify children are persisted via repository
 */

import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@shared/prisma/prisma.service'
import { ProductsController } from '@products/product.controller'
import { ProductService } from '@products/product.service'
import {
  ProductRepository,
  PrismaProductRepository,
} from '@products/product.repository'
import { ProductLabelField_TEService } from '@products/product-label-field-te.service'
import {
  ProductLabelField_TE_Repository,
  PrismaProductLabelField_TE_Repository,
} from '@products/product-label-field-te.repository'
import { ProductPanel_TEService } from '@products/product-panel-te.service'
import {
  ProductPanel_TE_Repository,
  PrismaProductPanel_TE_Repository,
} from '@products/product-panel-te.repository'
import { createTenantContext } from '../../src/test-utils'

describe('T-092d: Product_TE with children', () => {
  let productController: ProductsController
  let labelFieldService: ProductLabelField_TEService
  let panelService: ProductPanel_TEService
  let prismaMock: {
    product_TE: { findUnique: jest.Mock; findMany: jest.Mock; upsert: jest.Mock; update: jest.Mock }
    productLabelField_TE: { findUnique: jest.Mock; findMany: jest.Mock; upsert: jest.Mock; delete: jest.Mock }
    productPanel_TE: { findUnique: jest.Mock; findMany: jest.Mock; upsert: jest.Mock; update: jest.Mock }
  }

  const tenantCtx = createTenantContext()
  const mockRequest = { context: tenantCtx } as any

  beforeEach(async () => {
    prismaMock = {
      product_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: args.where.id, ...args.create }),
        ),
        update: jest.fn(),
      },
      productLabelField_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: args.where.id, ...args.create }),
        ),
        delete: jest.fn(),
      },
      productPanel_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: args.where.id, ...args.create }),
        ),
        update: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        // Product
        ProductService,
        PrismaProductRepository,
        { provide: ProductRepository, useExisting: PrismaProductRepository },
        // ProductLabelField
        ProductLabelField_TEService,
        PrismaProductLabelField_TE_Repository,
        {
          provide: ProductLabelField_TE_Repository,
          useExisting: PrismaProductLabelField_TE_Repository,
        },
        // ProductPanel
        ProductPanel_TEService,
        PrismaProductPanel_TE_Repository,
        {
          provide: ProductPanel_TE_Repository,
          useExisting: PrismaProductPanel_TE_Repository,
        },
        // Mock Prisma
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    productController = module.get(ProductsController)
    labelFieldService = module.get(ProductLabelField_TEService)
    panelService = module.get(ProductPanel_TEService)
  })

  // ---------------------------------------------------------------
  // Create Product
  // ---------------------------------------------------------------
  it('should create Product_TE with all basic fields', async () => {
    // Arrange
    const dto = {
      internalName: 'Test Product',
      code: 'PROD-001',
      status: 'DRAFT' as const,
    }

    // Act
    const result = await productController.create(dto, mockRequest)

    // Assert — response DTO
    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.internalName).toBe('Test Product')
    expect(result.code).toBe('PROD-001')
    expect(result.tenantId).toBe(tenantCtx.tenantId)

    // Assert — Prisma was called with correct data
    expect(prismaMock.product_TE.upsert).toHaveBeenCalledTimes(1)
    const upsertCall = prismaMock.product_TE.upsert.mock.calls[0][0]
    expect(upsertCall.create).toMatchObject({
      internalName: 'Test Product',
      code: 'PROD-001',
      tenantId: tenantCtx.tenantId,
    })
  })

  // ---------------------------------------------------------------
  // Add children
  // ---------------------------------------------------------------
  it('should create ProductLabelField_TE and ProductPanel_TE linked to the product', async () => {
    // Arrange — first create the product
    const productDto = {
      internalName: 'Product With Children',
      code: 'PROD-002',
    }
    const product = await productController.create(productDto, mockRequest)
    const productId = product.id

    // Act — create LabelField
    const labelField = await labelFieldService.create(
      {
        productId,
        labelFieldId: 'label-field-pl-1',
        designerValue: 'Designer Label',
        gerencialValue: 'Gerencial Label',
      },
      tenantCtx,
    )

    // Act — create Panel
    const panel = await panelService.create(
      {
        productId,
        panelNumber: 1,
        type: 'MAIN' as any,
        geometricFormatTypeId: null,
        geometricFormatValues: null,
      },
      tenantCtx,
    )

    // Assert — LabelField
    expect(labelField).toBeDefined()
    expect(labelField.productId).toBe(productId)
    expect(labelField.labelFieldId).toBe('label-field-pl-1')
    expect(labelField.designerValue).toBe('Designer Label')

    expect(prismaMock.productLabelField_TE.upsert).toHaveBeenCalled()
    const labelFieldUpsert =
      prismaMock.productLabelField_TE.upsert.mock.calls[0][0]
    expect(labelFieldUpsert.create).toMatchObject({
      productId,
      labelFieldId: 'label-field-pl-1',
      designerValue: 'Designer Label',
      gerencialValue: 'Gerencial Label',
      tenantId: tenantCtx.tenantId,
    })

    // Assert — Panel
    expect(panel).toBeDefined()
    expect(panel.productId).toBe(productId)
    expect(panel.panelNumber).toBe(1)

    expect(prismaMock.productPanel_TE.upsert).toHaveBeenCalled()
    const panelUpsert = prismaMock.productPanel_TE.upsert.mock.calls[0][0]
    expect(panelUpsert.create).toMatchObject({
      productId,
      panelNumber: 1,
      type: 'MAIN',
      tenantId: tenantCtx.tenantId,
    })
  })

  // ---------------------------------------------------------------
  // Verify children via findByProduct
  // ---------------------------------------------------------------
  it('should retrieve children by productId', async () => {
    // Arrange — create product + children
    const product = await productController.create(
      { internalName: 'Verify Children', code: 'PROD-003' },
      mockRequest,
    )
    const productId = product.id

    // Create child records via services
    await labelFieldService.create(
      { productId, labelFieldId: 'lf-1', designerValue: 'V1', gerencialValue: null },
      tenantCtx,
    )
    await labelFieldService.create(
      { productId, labelFieldId: 'lf-2', designerValue: 'V2', gerencialValue: null },
      tenantCtx,
    )
    await panelService.create(
      { productId, panelNumber: 1, type: 'MAIN' as any, geometricFormatTypeId: null, geometricFormatValues: null },
      tenantCtx,
    )
    await panelService.create(
      { productId, panelNumber: 2, type: 'SECONDARY' as any, geometricFormatTypeId: null, geometricFormatValues: null },
      tenantCtx,
    )

    // Mock the findMany responses so the service can read them back
    // Note: IDs must be valid UUIDs (Id.from() validates format)
    const lf1Id = '11111111-1111-4111-a111-111111111111'
    const lf2Id = '22222222-2222-4222-a222-222222222222'
    const p1Id = '33333333-3333-4333-a333-333333333333'
    const p2Id = '44444444-4444-4444-a444-444444444444'
    const mockedLabelFields = [
      { id: lf1Id, tenantId: tenantCtx.tenantId, productId, labelFieldId: lf1Id, designerValue: 'V1', gerencialValue: null, createdAt: new Date(), updatedAt: new Date() },
      { id: lf2Id, tenantId: tenantCtx.tenantId, productId, labelFieldId: lf2Id, designerValue: 'V2', gerencialValue: null, createdAt: new Date(), updatedAt: new Date() },
    ]
    const mockedPanels = [
      { id: p1Id, tenantId: tenantCtx.tenantId, productId, panelNumber: 1, type: 'MAIN', geometricFormatTypeId: null, geometricFormatValues: null, systemState: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() },
      { id: p2Id, tenantId: tenantCtx.tenantId, productId, panelNumber: 2, type: 'SECONDARY', geometricFormatTypeId: null, geometricFormatValues: null, systemState: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() },
    ]

    prismaMock.productLabelField_TE.findMany.mockResolvedValue(mockedLabelFields)
    prismaMock.productPanel_TE.findMany.mockResolvedValue(mockedPanels)

    // Act
    const labelFields = await labelFieldService.findByProduct(productId, tenantCtx)
    const panels = await panelService.findByProduct(productId, tenantCtx)

    // Assert
    expect(labelFields).toHaveLength(2)
    expect(labelFields[0]!.labelFieldId).toBe(lf1Id)
    expect(labelFields[1]!.labelFieldId).toBe(lf2Id)

    expect(panels).toHaveLength(2)
    expect(panels[0]!.panelNumber).toBe(1)
    expect(panels[1]!.panelNumber).toBe(2)
  })
})
