import { UnitConversion_PLService } from './unit-conversion-pl.service'
import { UnitConversion_PL } from './unit-conversion-pl.entity'
import { UnitConversion_PLNotFoundError } from './unit-conversion-pl.errors'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('UnitConversion_PLService', () => {
  let service: UnitConversion_PLService
  let repository: any

  const platformCtx: RequestContext = {
    userId: 'admin',
    scope: UserScope.PLATFORM,
    roles: ['ADMIN'],
    impersonatedTenantId: null
  }

  const defaultCreateProps = {
    fromUnitId: 'unit-1',
    toUnitId: 'unit-2',
    factor: 1000
  }

  function createEntity(overrides: Record<string, any> = {}): UnitConversion_PL {
    return UnitConversion_PL.create({
      ...defaultCreateProps,
      ...overrides
    })
  }

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByFromUnit: jest.fn(),
      findByToUnit: jest.fn(),
      delete: jest.fn()
    }

    service = new UnitConversion_PLService(repository)
  })

  describe('create', () => {
    it('should create entity and save', async () => {
      const entity = createEntity()
      repository.save.mockResolvedValue(entity)

      const result = await service.create(defaultCreateProps, platformCtx)

      expect(result.fromUnitId).toBe('unit-1')
      expect(result.toUnitId).toBe('unit-2')
      expect(repository.save).toHaveBeenCalledWith(
        expect.any(UnitConversion_PL),
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

    it('should throw UnitConversion_PLNotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', platformCtx)).rejects.toThrow(
        UnitConversion_PLNotFoundError
      )
    })
  })

  describe('findAll', () => {
    it('should call repository.findAll with filter and ctx', async () => {
      const entity = createEntity()
      repository.findAll.mockResolvedValue([entity])

      const filter = { fromUnitId: 'unit-1' }
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

    it('should throw UnitConversion_PLNotFoundError when entity not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', platformCtx)).rejects.toThrow(
        UnitConversion_PLNotFoundError
      )
    })
  })
})
