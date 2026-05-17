import { Injectable } from '@nestjs/common'
import { PlatformMembershipRepository, PlatformMembershipFilter } from '@platform-memberships/platform-membership.repository'
import { PlatformMembership, CreatePlatformMembershipProps } from '@platform-memberships/platform-membership.entity'
import { PlatformMembershipNotFoundError } from '@platform-memberships/platform-membership.errors'
import { RequestContext } from '@authorization/authorization.types'
import { SystemState } from '@shared/behaviours/lockable'

@Injectable()
export class PlatformMembershipService {
  constructor(private readonly repository: PlatformMembershipRepository) {}

  async create(props: CreatePlatformMembershipProps, context: RequestContext): Promise<PlatformMembership> {
    const membership = PlatformMembership.create(props)
    return this.repository.save(membership)
  }

  async findAll(filter?: PlatformMembershipFilter, context?: RequestContext): Promise<PlatformMembership[]> {
    return this.repository.findAll(filter)
  }

  async findById(id: string, context: RequestContext): Promise<PlatformMembership> {
    const membership = await this.repository.findById(id)
    if (!membership) {
      throw new PlatformMembershipNotFoundError(id)
    }
    return membership
  }

  async save(membership: PlatformMembership, context: RequestContext): Promise<PlatformMembership> {
    return this.repository.save(membership)
  }

  async delete(id: string, context: RequestContext): Promise<void> {
    const membership = await this.findById(id, context)
    membership.delete()
    await this.repository.save(membership)
  }

  async activate(id: string, context: RequestContext): Promise<PlatformMembership> {
    const membership = await this.findById(id, context)
    membership.activate()
    return this.repository.save(membership)
  }

  async lock(id: string, context: RequestContext): Promise<PlatformMembership> {
    const membership = await this.findById(id, context)
    membership.lock()
    return this.repository.save(membership)
  }
}