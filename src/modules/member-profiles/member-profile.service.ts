import { Injectable } from '@nestjs/common'
import {
  MemberProfileRepository,
  MemberProfileFilter
} from '@member-profiles/member-profile.repository'
import {
  MemberProfile,
  CreateMemberProfileProps
} from '@member-profiles/member-profile.entity'
import { MemberProfileNotFoundError } from '@member-profiles/member-profile.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class MemberProfileService {
  constructor(private readonly repository: MemberProfileRepository) {}

  async create(
    props: CreateMemberProfileProps,
    ctx: RequestContext
  ): Promise<MemberProfile> {
    const profile = MemberProfile.create(props)
    return this.repository.save(profile, ctx)
  }

  async findAll(
    filter: MemberProfileFilter,
    ctx: RequestContext
  ): Promise<MemberProfile[]> {
    const profiles = await this.repository.findAll(filter, ctx)
    if (profiles.length === 0) {
      return []
    }
    return profiles
  }

  async findById(id: string, ctx: RequestContext): Promise<MemberProfile> {
    const profile = await this.repository.findById(id, ctx)
    if (!profile) {
      throw new MemberProfileNotFoundError()
    }
    return profile
  }

  async save(
    profile: MemberProfile,
    ctx: RequestContext
  ): Promise<MemberProfile> {
    return this.repository.save(profile, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const profile = await this.findById(id, ctx)
    profile.delete()
    await this.repository.save(profile, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<MemberProfile> {
    const profile = await this.findById(id, ctx)
    profile.activate()
    return this.repository.save(profile, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<MemberProfile> {
    const profile = await this.findById(id, ctx)
    profile.lock()
    return this.repository.save(profile, ctx)
  }
}
