import { Injectable } from '@nestjs/common'
import { ProductCategory_PLRepository } from '@products/product-category-pl.repository'
import {
  ProductCategory_PL,
  CreateProductCategoryPLProps
} from '@products/product-category-pl.entity'
import { ProductCategory_PLNotFoundError } from '@products/product-category-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class ProductCategory_PLService {
  constructor(
    private readonly repository: ProductCategory_PLRepository
  ) {}

  async create(
    props: CreateProductCategoryPLProps,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL> {
    const category = ProductCategory_PL.create(props)
    return this.repository.save(category, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<ProductCategory_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL> {
    const category = await this.repository.findById(id, _ctx)
    if (!category) {
      throw new ProductCategory_PLNotFoundError()
    }
    return category
  }

  async save(
    category: ProductCategory_PL,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL> {
    return this.repository.save(category, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const category = await this.findById(id, _ctx)
    category.delete()
    await this.repository.save(category, _ctx)
  }

  async activate(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL> {
    const category = await this.findById(id, _ctx)
    category.activate()
    return this.repository.save(category, _ctx)
  }

  async lock(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL> {
    const category = await this.findById(id, _ctx)
    category.lock()
    return this.repository.save(category, _ctx)
  }

  async unlock(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL> {
    const category = await this.findById(id, _ctx)
    category.unlock()
    return this.repository.save(category, _ctx)
  }
}
