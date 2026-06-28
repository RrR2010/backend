import { Injectable } from '@nestjs/common'
import { ProductSubcategory_PLRepository } from '@products/product-subcategory-pl.repository'
import {
  ProductSubcategory_PL,
  CreateProductSubcategoryPLProps
} from '@products/product-subcategory-pl.entity'
import { ProductSubcategory_PLNotFoundError } from '@products/product-subcategory-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class ProductSubcategory_PLService {
  constructor(
    private readonly repository: ProductSubcategory_PLRepository
  ) {}

  async create(
    props: CreateProductSubcategoryPLProps,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL> {
    const subcategory = ProductSubcategory_PL.create(props)
    return this.repository.save(subcategory, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<ProductSubcategory_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findByCategoryId(
    categoryId: string,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL[]> {
    return this.repository.findAll({ categoryId }, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL> {
    const subcategory = await this.repository.findById(id, _ctx)
    if (!subcategory) {
      throw new ProductSubcategory_PLNotFoundError()
    }
    return subcategory
  }

  async save(
    subcategory: ProductSubcategory_PL,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL> {
    return this.repository.save(subcategory, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const subcategory = await this.findById(id, _ctx)
    subcategory.delete()
    await this.repository.save(subcategory, _ctx)
  }

  async activate(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL> {
    const subcategory = await this.findById(id, _ctx)
    subcategory.activate()
    return this.repository.save(subcategory, _ctx)
  }

  async lock(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL> {
    const subcategory = await this.findById(id, _ctx)
    subcategory.lock()
    return this.repository.save(subcategory, _ctx)
  }

  async unlock(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL> {
    const subcategory = await this.findById(id, _ctx)
    subcategory.unlock()
    return this.repository.save(subcategory, _ctx)
  }
}
