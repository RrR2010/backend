import { Injectable } from '@nestjs/common'
import { MemberProfileRepository, MemberProfileFilter } from '@member-profiles/member-profile.repository'
import { MemberProfile, CreateMemberProfileProps } from '@member-profiles/member-profile.entity'
import { MemberProfileNotFoundError } from '@member-profiles/member-profile.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class MemberProfileService {
  constructor(private readonly repository: MemberProfileRepository) {}

  async create(props: CreateMemberProfileProps, context: RequestContext): Promise<MemberProfile> {
    const profile = MemberProfile.create(props)
    return this.repository.save(profile)
  }

  async findAll(filter?: MemberProfileFilter, context?: RequestContext): Promise<MemberProfile[]> {
    return this.repository.findAll(filter)
  }

  async findById(id: string, context: RequestContext): Promise<MemberProfile> {
    const profile = await this.repository.findById(id)
    if (!profile) {
      throw new MemberProfileNotFoundError(id)
    }
    return profile
  }

  async save(profile: MemberProfile, context: RequestContext): Promise<MemberProfile> {
    return this.repository.save(profile)
  }

  async delete(id: string, context: RequestContext): Promise<void> {
    const profile = await this.findById(id, context)
    profile.delete()
    await this.repository.save(profile)
  }

  async activate(id: string, context: RequestContext): Promise<MemberProfile> {
    const profile = await this.findById(id, context)
    profile.activate()
    return this.repository.save(profile)
  }

  async lock(id: string, context: RequestContext): Promise<MemberProfile> {
    const profile = await this.findById(id, context)
    profile.lock()
    return this.repository.save(profile)
  }
}