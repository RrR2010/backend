import { InternalServerErrorException } from '@nestjs/common'
import { TechnicalSource_TEService } from './technical-source-te.service'
import { TechnicalSource_TE } from './technical-source-te.entity'
import { TechnicalSource_TENotFoundError } from './technical-source-te.errors'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('TechnicalSource_TEService', () => {
  let service: TechnicalSource_TEService
  let repository: any

  const tenantCtx: RequestContext = {
    userId: 'user-1',
    scope: UserScope.TENANT,
    tenantId: 'tenant-1',
    roles: ['ADMIN']
  }

  const platformCtx: RequestContext = {
    userId: 'admin',
    scope: UserScope.PLATFORM,
    roles: ['ADMIN'],
    impersonatedTenantId: null
  }

  const defaultCreateProps = {
    sourceTypePlId: 'type-pl-1',
    sourceTypeTeId: null,
    referenceName: 'Test Reference',
    url: null,
    documentRef: null,
    notes: null
  }

  function createEntity(overrides: Record<string, any> = {}): TechnicalSource_TE {
    return TechnicalSource_TE.create({
      ...defaultCreateProps,
      tenantId: 'tenant-1',
      ...overrides
    })
  }

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    }

    service = new TechnicalSource_TEService(repository)
  })

  describe('create', () => {
    it('should resolve tenantId from ctx, create entity, and save', async () => {
      const entity = createEntity()
      repository.save.mockResolvedValue(entity)

      const result = await service.create(defaultCreateProps, tenantCtx)

      expect(result.tenantId).toBe('tenant-1')
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({ tenantId: 'tenant-1' })
        }),
        tenantCtx
      )
    })

    it('should throw InternalServerErrorException when ctx has no tenantId', async () => {
      await expect(service.create(defaultCreateProps, platformCtx)).rejects.toThrow(
        InternalServerErrorException
      )
    })
  })

  describe('findById', () => {
    it('should return entity when found', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)

      const result = await service.findById(entity.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, tenantCtx)
      expect(result).toBe(entity)
    })

    it('should throw TechnicalSource_TENotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', tenantCtx)).rejects.toThrow(
        TechnicalSource_TENotFoundError
      )
    })
  })

  describe('findAll', () => {
    it('should call repository.findAll with filter and ctx', async () => {
      const entity = createEntity()
      repository.findAll.mockResolvedValue([entity])

      const filter = { referenceName: 'Test' }
      const result = await service.findAll(filter, tenantCtx)

      expect(repository.findAll).toHaveBeenCalledWith(filter, tenantCtx)
      expect(result).toHaveLength(1)
      expect(result[0]).toBe(entity)
    })
  })

  describe('delete', () => {
    it('should find entity, call delete, and save', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)
      repository.save.mockResolvedValue(entity)

      await service.delete(entity.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, tenantCtx)
      expect(repository.save).toHaveBeenCalled()
    })

    it('should throw TechnicalSource_TENotFoundError when entity not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', tenantCtx)).rejects.toThrow(
        TechnicalSource_TENotFoundError
      )
    })
  })
})
