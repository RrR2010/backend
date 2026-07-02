import { InternalServerErrorException } from '@nestjs/common'
import { FunctionalGroupService } from './functional-group.service'
import { FunctionalGroup_TE } from './functional-group.entity'
import { FunctionalGroupNotFoundError } from './functional-group.errors'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('FunctionalGroupService', () => {
  let service: FunctionalGroupService
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
    name: 'Test Group',
    code: null,
    sortOrder: 1,
    isActive: true
  }

  function createEntity(overrides: Record<string, any> = {}): FunctionalGroup_TE {
    return FunctionalGroup_TE.create({
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

    service = new FunctionalGroupService(repository)
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

    it('should throw FunctionalGroupNotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', tenantCtx)).rejects.toThrow(
        FunctionalGroupNotFoundError
      )
    })
  })

  describe('findAll', () => {
    it('should call repository.findAll with filter and ctx', async () => {
      const entity = createEntity()
      repository.findAll.mockResolvedValue([entity])

      const filter = { name: 'Test' }
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

    it('should throw FunctionalGroupNotFoundError when entity not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', tenantCtx)).rejects.toThrow(
        FunctionalGroupNotFoundError
      )
    })
  })
})
