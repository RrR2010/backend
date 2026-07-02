import { Nutrient_PLService } from './nutrient-pl.service'
import { Nutrient_PL } from './nutrient-pl.entity'
import { Nutrient_PLNotFoundError } from './nutrient-pl.errors'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('Nutrient_PLService', () => {
  let service: Nutrient_PLService
  let repository: any

  const platformCtx: RequestContext = {
    userId: 'admin',
    scope: UserScope.PLATFORM,
    roles: ['ADMIN'],
    impersonatedTenantId: null
  }

  const defaultCreateProps = {
    name: 'Test Nutrient',
    unit: 'G' as const,
    category: 'MACRO' as const,
    parentId: null,
    level: 1,
    sortOrder: 1,
    regulatoryRef: null
  }

  function createEntity(overrides: Record<string, any> = {}): Nutrient_PL {
    return Nutrient_PL.create({
      ...defaultCreateProps,
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

    service = new Nutrient_PLService(repository)
  })

  describe('create', () => {
    it('should create entity and save', async () => {
      const entity = createEntity()
      repository.save.mockResolvedValue(entity)

      const result = await service.create(defaultCreateProps, platformCtx)

      expect(result.name).toBe('Test Nutrient')
      expect(repository.save).toHaveBeenCalledWith(
        expect.any(Nutrient_PL),
        platformCtx
      )
    })
  })

  describe('findById', () => {
    it('should return entity when found', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)

      const result = await service.findById(entity.id.value, platformCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, platformCtx)
      expect(result).toBe(entity)
    })

    it('should throw Nutrient_PLNotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', platformCtx)).rejects.toThrow(
        Nutrient_PLNotFoundError
      )
    })
  })

  describe('findAll', () => {
    it('should call repository.findAll with filter and ctx', async () => {
      const entity = createEntity()
      repository.findAll.mockResolvedValue([entity])

      const filter = { name: 'Test' }
      const result = await service.findAll(filter, platformCtx)

      expect(repository.findAll).toHaveBeenCalledWith(filter, platformCtx)
      expect(result).toHaveLength(1)
      expect(result[0]).toBe(entity)
    })
  })

  describe('delete', () => {
    it('should find entity, call delete, and save', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)
      repository.save.mockResolvedValue(entity)

      await service.delete(entity.id.value, platformCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, platformCtx)
      expect(repository.save).toHaveBeenCalled()
    })

    it('should throw Nutrient_PLNotFoundError when entity not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', platformCtx)).rejects.toThrow(
        Nutrient_PLNotFoundError
      )
    })
  })
})
