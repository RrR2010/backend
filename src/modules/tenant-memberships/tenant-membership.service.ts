import { Injectable } from '@nestjs/common'
import {
  TenantMembershipRepository,
  TenantMembershipFilter
} from '@tenant-memberships/tenant-membership.repository'
import {
  TenantMembership,
  CreateTenantMembershipProps
} from '@tenant-memberships/tenant-membership.entity'
import { TenantMembershipNotFoundError } from '@tenant-memberships/tenant-membership.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class TenantMembershipService {
  constructor(private readonly repository: TenantMembershipRepository) {}

  async create(
    props: CreateTenantMembershipProps,
    ctx: RequestContext
  ): Promise<TenantMembership> {
    const membership = TenantMembership.create(props)
    return this.repository.save(membership, ctx)
  }

  async findAll(
    filter: TenantMembershipFilter,
    ctx: RequestContext
  ): Promise<TenantMembership[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<TenantMembership> {
    const membership = await this.repository.findById(id, ctx)
    if (!membership) {
      throw new TenantMembershipNotFoundError(id)
    }
    return membership
  }

  async save(
    membership: TenantMembership,
    ctx: RequestContext
  ): Promise<TenantMembership> {
    return this.repository.save(membership, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const membership = await this.findById(id, ctx)
    membership.delete()
    await this.repository.save(membership, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<TenantMembership> {
    const membership = await this.findById(id, ctx)
    membership.activate()
    return this.repository.save(membership, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<TenantMembership> {
    const membership = await this.findById(id, ctx)
    membership.lock()
    return this.repository.save(membership, ctx)
  }
}
