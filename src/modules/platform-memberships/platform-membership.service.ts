import { Injectable } from '@nestjs/common'
import {
  PlatformMembershipRepository,
  PlatformMembershipFilter
} from '@platform-memberships/platform-membership.repository'
import {
  PlatformMembership,
  CreatePlatformMembershipProps
} from '@platform-memberships/platform-membership.entity'
import { PlatformMembershipNotFoundError } from '@platform-memberships/platform-membership.errors'
import { RequestContext } from '@authorization/authorization.types'
import { SystemState } from '@shared/behaviours/lockable'

@Injectable()
export class PlatformMembershipService {
  constructor(private readonly repository: PlatformMembershipRepository) {}

  async create(
    props: CreatePlatformMembershipProps,
    ctx: RequestContext
  ): Promise<PlatformMembership> {
    const membership = PlatformMembership.create(props)
    return this.repository.save(membership, ctx)
  }

  async findAll(
    filter: PlatformMembershipFilter,
    ctx: RequestContext
  ): Promise<PlatformMembership[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<PlatformMembership> {
    const membership = await this.repository.findById(id, ctx)
    if (!membership) {
      throw new PlatformMembershipNotFoundError(id)
    }
    return membership
  }

  async save(
    membership: PlatformMembership,
    ctx: RequestContext
  ): Promise<PlatformMembership> {
    return this.repository.save(membership, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const membership = await this.findById(id, ctx)
    membership.delete()
    await this.repository.save(membership, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<PlatformMembership> {
    const membership = await this.findById(id, ctx)
    membership.activate()
    return this.repository.save(membership, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<PlatformMembership> {
    const membership = await this.findById(id, ctx)
    membership.lock()
    return this.repository.save(membership, ctx)
  }
}
