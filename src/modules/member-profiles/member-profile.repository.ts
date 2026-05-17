import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { MemberProfile } from '@member-profiles/member-profile.entity'
import { MemberProfile as PrismaMemberProfile, Prisma } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { SystemState, Gender } from '@shared/enums'

export interface MemberProfileFilter {
  platformMembershipId?: string
  tenantMembershipId?: string
  gender?: Gender
  locale?: string
  timezone?: string
}

export abstract class MemberProfileRepository {
  abstract findById(id: string): Promise<MemberProfile | null>
  abstract findAll(filter?: MemberProfileFilter): Promise<MemberProfile[]>
  abstract save(profile: MemberProfile): Promise<MemberProfile>
  abstract delete(id: string): Promise<void>
}

@Injectable()
export class PrismaMemberProfileRepository implements MemberProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

async findById(id: string): Promise<MemberProfile | null> {
    const profile = await this.prisma.memberProfile.findUnique({
      where: { id }
    })
    if (!profile) return null
    return PrismaMemberProfileMapper.toDomain(profile)
  }

  async findAll(filter?: MemberProfileFilter): Promise<MemberProfile[]> {
    const where: Prisma.MemberProfileWhereInput = {}
    if (filter?.platformMembershipId)
      where.platformMembershipId = filter.platformMembershipId
    if (filter?.tenantMembershipId)
      where.tenantMembershipId = filter.tenantMembershipId
    if (filter?.gender) where.gender = filter.gender
    if (filter?.locale) where.locale = filter.locale
    if (filter?.timezone) where.timezone = filter.timezone

    const profiles = await this.prisma.memberProfile.findMany({ where })
    return profiles.map((profile) =>
      PrismaMemberProfileMapper.toDomain(profile)
    )
  }

  async save(profile: MemberProfile): Promise<MemberProfile> {
    const data = PrismaMemberProfileMapper.toPersistence(profile)
    await this.prisma.memberProfile.upsert({
      where: { id: profile.id.value },
      update: {
        externalId: data.externalId,
        fullName: data.fullName,
        displayName: data.displayName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        photoUrl: data.photoUrl,
        locale: data.locale,
        timezone: data.timezone,
        language: data.language,
        platformMembershipId: data.platformMembershipId,
        tenantMembershipId: data.tenantMembershipId,
        systemState: data.systemState,
        updatedAt: data.updatedAt
      },
      create: data
    })
    return profile
  }

  async delete(id: string): Promise<void> {
    await this.prisma.memberProfile.delete({ where: { id } })
  }
}

class PrismaMemberProfileMapper {
  static toDomain(profile: PrismaMemberProfile): MemberProfile {
    return MemberProfile.rehydrate({
      id: Id.from(profile.id),
      externalId: profile.externalId,
      fullName: profile.fullName,
      displayName: profile.displayName,
      dateOfBirth: profile.dateOfBirth ?? null,
      gender: profile.gender as Gender | null,
      photoUrl: profile.photoUrl,
      locale: profile.locale,
      timezone: profile.timezone,
      language: profile.language,
      platformMembershipId: profile.platformMembershipId,
      tenantMembershipId: profile.tenantMembershipId,
      systemState: SystemState[profile.systemState as keyof typeof SystemState],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    })
  }

  static toPersistence(profile: MemberProfile): PrismaMemberProfile {
    return {
      id: profile.id.value,
      externalId: profile.externalId,
      fullName: profile.fullName,
      displayName: profile.displayName,
      dateOfBirth: profile.dateOfBirth ?? null,
      gender: profile.gender ?? null,
      photoUrl: profile.photoUrl,
      locale: profile.locale,
      timezone: profile.timezone,
      language: profile.language,
      platformMembershipId: profile.platformMembershipId,
      tenantMembershipId: profile.tenantMembershipId,
      systemState: profile.systemState,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    }
  }
}
