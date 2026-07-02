import { UnitOfMeasure_PLService } from './unit-of-measure-pl.service'
import { UnitOfMeasure_PL } from './unit-of-measure-pl.entity'
import { UnitOfMeasure_PLNotFoundError } from './unit-of-measure-pl.errors'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('UnitOfMeasure_PLService', () => {
  let service: UnitOfMeasure_PLService
  let repository: any

  const platformCtx: RequestContext = {
    userId: 'admin',
    scope: UserScope.PLATFORM,
    roles: ['ADMIN'],
    impersonatedTenantId: null
  }

  const defaultCreateProps = {
    code: 'KG',
    symbol: 'kg',
    measurementType: 'MASS' as const,
    measurementSystem: 'METRIC' as const
  }

  function createEntity(overrides: Record<string, any> = {}): UnitOfMeasure_PL {
    return UnitOfMeasure_PL.create({
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

    service = new UnitOfMeasure_PLService(repository)
  })

  describe('create', () => {
    it('should create entity and save', async () => {
      const entity = createEntity()
      repository.save.mockResolvedValue(entity)

      const result = await service.create(defaultCreateProps, platformCtx)

      expect(result.code).toBe('KG')
      expect(repository.save).toHaveBeenCalledWith(
        expect.any(UnitOfMeasure_PL),
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

    it('should throw UnitOfMeasure_PLNotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', platformCtx)).rejects.toThrow(
        UnitOfMeasure_PLNotFoundError
      )
    })
  })

  describe('findAll', () => {
    it('should call repository.findAll with filter and ctx', async () => {
      const entity = createEntity()
      repository.findAll.mockResolvedValue([entity])

      const filter = { measurementType: 'MASS' }
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

    it('should throw UnitOfMeasure_PLNotFoundError when entity not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', platformCtx)).rejects.toThrow(
        UnitOfMeasure_PLNotFoundError
      )
    })
  })
})
