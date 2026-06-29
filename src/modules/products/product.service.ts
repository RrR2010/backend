import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { ProductRepository, type ProductFilter } from './product.repository'
import { Product_TE, type CreateProduct_TEProps } from './product.entity'
import { ProductNotFoundError, ProductAlreadyExistsError } from './product.errors'

@Injectable()
export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async create(props: Omit<CreateProduct_TEProps, 'tenantId'>, ctx: RequestContext): Promise<Product_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (!effectiveTenantId) throw new InternalServerErrorException('tenantId is required')
    const tenantId = ctx.scope === UserScope.TENANT ? ctx.tenantId : effectiveTenantId
    const product = Product_TE.create({ ...props, tenantId })
    try {
      return await this.repository.save(product, ctx)
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ProductAlreadyExistsError()
      }
      throw error
    }
  }

  async findAll(filter: ProductFilter, ctx: RequestContext): Promise<Product_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Product_TE> {
    const product = await this.repository.findById(id, ctx)
    if (!product) throw new ProductNotFoundError()
    return product
  }

  async update(id: string, props: Partial<CreateProduct_TEProps>, ctx: RequestContext): Promise<Product_TE> {
    const product = await this.findById(id, ctx)
    if (props.internalName !== undefined) product.changeInternalName(props.internalName)
    if (props.code !== undefined) product.changeCode(props.code)
    if (props.status !== undefined) product.changeStatus(props.status)
    if (props.externalCode !== undefined) product.changeExternalCode(props.externalCode)
    if (props.displayName !== undefined) product.changeDisplayName(props.displayName)
    if (props.commercialName !== undefined) product.changeCommercialName(props.commercialName)
    if (props.saleDenomination !== undefined) product.changeSaleDenomination(props.saleDenomination)
    if (props.barcodeGtin !== undefined) product.changeBarcodeGtin(props.barcodeGtin)
    if (props.packagingType !== undefined) product.changePackagingType(props.packagingType)
    if (props.batchCode !== undefined) product.changeBatchCode(props.batchCode)
    if (props.declaredWeight !== undefined) product.changeDeclaredWeight(props.declaredWeight)
    if (props.declaredVolume !== undefined) product.changeDeclaredVolume(props.declaredVolume)
    if (props.shelfLifeDays !== undefined) product.changeShelfLifeDays(props.shelfLifeDays)
    if (props.storageConditions !== undefined) product.changeStorageConditions(props.storageConditions)
    if (props.productFamilyId !== undefined) product.changeProductFamilyId(props.productFamilyId)
    if (props.commercialLineId !== undefined) product.changeCommercialLineId(props.commercialLineId)
    if (props.notes !== undefined) product.changeNotes(props.notes)
    try {
      return await this.repository.save(product, ctx)
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ProductAlreadyExistsError()
      }
      throw error
    }
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    await this.findById(id, ctx)
    await this.repository.delete(id, ctx)
  }
}
