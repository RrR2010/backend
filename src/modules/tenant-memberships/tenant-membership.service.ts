import { Injectable } from '@nestjs/common'
import { TenantMembershipRepository, TenantMembershipFilter } from '@tenant-memberships/tenant-membership.repository'
import { TenantMembership, CreateTenantMembershipProps } from '@tenant-memberships/tenant-membership.entity'
import { TenantMembershipNotFoundError } from '@tenant-memberships/tenant-membership.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class TenantMembershipService {
  constructor(private readonly repository: TenantMembershipRepository) {}

  async create(props: CreateTenantMembershipProps, context: RequestContext): Promise<TenantMembership> {
    const membership = TenantMembership.create(props)
    return this.repository.save(membership)
  }

  async findAll(filter?: TenantMembershipFilter, context?: RequestContext): Promise<TenantMembership[]> {
    return this.repository.findAll(filter)
  }

  async findById(id: string, context: RequestContext): Promise<TenantMembership> {
    const membership = await this.repository.findById(id)
    if (!membership) {
      throw new TenantMembershipNotFoundError(id)
    }
    return membership
  }

  async save(membership: TenantMembership, context: RequestContext): Promise<TenantMembership> {
    return this.repository.save(membership)
  }

  async delete(id: string, context: RequestContext): Promise<void> {
    const membership = await this.findById(id, context)
    membership.delete()
    await this.repository.save(membership)
  }

  async activate(id: string, context: RequestContext): Promise<TenantMembership> {
    const membership = await this.findById(id, context)
    membership.activate()
    return this.repository.save(membership)
  }

  async lock(id: string, context: RequestContext): Promise<TenantMembership> {
    const membership = await this.findById(id, context)
    membership.lock()
    return this.repository.save(membership)
  }
}