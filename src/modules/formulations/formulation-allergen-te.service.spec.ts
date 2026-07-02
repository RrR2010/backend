import { InternalServerErrorException } from '@nestjs/common'
import { FormulationAllergen_TEService } from './formulation-allergen-te.service'
import { FormulationAllergen_TE } from './formulation-allergen-te.entity'
import { FormulationAllergen_TENotFoundError } from './formulation-allergen-te.errors'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('FormulationAllergen_TEService', () => {
  let service: FormulationAllergen_TEService
  let repository: any

  const tenantCtx: RequestContext = {
    userId: 'user-1',
    scope: UserScope.TENANT,
    tenantId: 'tenant-1',
    roles: ['ADMIN'],
  }

  const platformCtx: RequestContext = {
    userId: 'admin',
    scope: UserScope.PLATFORM,
    roles: ['ADMIN'],
    impersonatedTenantId: null,
  }

  const defaultCreateProps = {
    formulationRevisionId: 'revision-1',
  }

  function createEntity(overrides: Record<string, any> = {}): FormulationAllergen_TE {
    return FormulationAllergen_TE.create({
      ...defaultCreateProps,
      tenantId: 'tenant-1',
      ...overrides,
    })
  }

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByRevisionId: jest.fn(),
      delete: jest.fn(),
    }
    service = new FormulationAllergen_TEService(repository)
  })

  describe('create', () => {
    it('should resolve tenantId from ctx, create entity, and save', async () => {
      const entity = createEntity()
      repository.save.mockResolvedValue(entity)

      const result = await service.create(defaultCreateProps, tenantCtx)

      expect(result.tenantId).toBe('tenant-1')
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({ tenantId: 'tenant-1' }),
        }),
        tenantCtx,
      )
    })

    it('should throw InternalServerErrorException when ctx has no tenantId', async () => {
      await expect(
        service.create(defaultCreateProps, platformCtx),
      ).rejects.toThrow(InternalServerErrorException)
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

    it('should throw FormulationAllergen_TENotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', tenantCtx)).rejects.toThrow(
        FormulationAllergen_TENotFoundError,
      )
    })
  })

  describe('findByRevisionId', () => {
    it('should return entity when found', async () => {
      const entity = createEntity()
      repository.findByRevisionId.mockResolvedValue(entity)

      const result = await service.findByRevisionId('revision-1', tenantCtx)

      expect(repository.findByRevisionId).toHaveBeenCalledWith('revision-1', tenantCtx)
      expect(result).toBe(entity)
    })

    it('should return null when not found', async () => {
      repository.findByRevisionId.mockResolvedValue(null)

      const result = await service.findByRevisionId('nonexistent', tenantCtx)

      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should find entity and call repository.delete', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)
      repository.delete.mockResolvedValue(undefined)

      await service.delete(entity.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, tenantCtx)
      expect(repository.delete).toHaveBeenCalledWith(entity.id.value, tenantCtx)
    })

    it('should throw FormulationAllergen_TENotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', tenantCtx)).rejects.toThrow(
        FormulationAllergen_TENotFoundError,
      )
    })
  })
})
