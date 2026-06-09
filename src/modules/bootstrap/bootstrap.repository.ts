import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TenantRegistration } from '@bootstrap/bootstrap.entity'
import {
  TenantRegistration as PrismaTenantRegistration,
  Prisma
} from '@prisma/client'
import { Id } from '@shared/value-objects'
import { RegistrationState } from '@shared/enums'
import { Json } from '@shared/types'
import { RequestContext } from '@authorization/authorization.types'
import { TenantRegistrationFilter } from '@bootstrap/bootstrap.types'

export abstract class TenantRegistrationRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<TenantRegistration | null>
  abstract findByExternalRef(
    externalRef: string,
    ctx: RequestContext
  ): Promise<TenantRegistration | null>
  abstract findByPaymentId(
    paymentId: string,
    ctx: RequestContext
  ): Promise<TenantRegistration | null>
  abstract findBySubscriptionId(
    subscriptionId: string,
    ctx: RequestContext
  ): Promise<TenantRegistration | null>
  abstract findAll(
    filter: TenantRegistrationFilter,
    ctx: RequestContext
  ): Promise<TenantRegistration[]>
  abstract save(
    registration: TenantRegistration,
    ctx: RequestContext
  ): Promise<TenantRegistration>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

// TODO: ctx is accepted on all methods for constitution compliance but not used for
// tenant filtering because TenantRegistration is a pre-provisioning entity — no tenant
// exists yet. Once provisioning creates the tenant, the registration record is immutable
// and remains platform-scoped.
/* eslint-disable @typescript-eslint/no-unused-vars */
@Injectable()
export class PrismaTenantRegistrationRepository implements TenantRegistrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<TenantRegistration | null> {
    const where: Prisma.TenantRegistrationWhereUniqueInput = { id }
    const prismaRegistration = await this.prisma.tenantRegistration.findUnique({
      where
    })
    if (!prismaRegistration) return null
    return PrismaTenantRegistrationMapper.toDomain(prismaRegistration)
  }

  async findByExternalRef(
    externalRef: string,
    ctx: RequestContext
  ): Promise<TenantRegistration | null> {
    const where: Prisma.TenantRegistrationWhereUniqueInput = { externalRef }
    const prismaRegistration = await this.prisma.tenantRegistration.findUnique({
      where
    })
    if (!prismaRegistration) return null
    return PrismaTenantRegistrationMapper.toDomain(prismaRegistration)
  }

  async findByPaymentId(
    paymentId: string,
    ctx: RequestContext
  ): Promise<TenantRegistration | null> {
    const where: Prisma.TenantRegistrationWhereUniqueInput = { paymentId }
    const prismaRegistration = await this.prisma.tenantRegistration.findUnique({
      where
    })
    if (!prismaRegistration) return null
    return PrismaTenantRegistrationMapper.toDomain(prismaRegistration)
  }

  async findBySubscriptionId(
    subscriptionId: string,
    ctx: RequestContext
  ): Promise<TenantRegistration | null> {
    const where: Prisma.TenantRegistrationWhereUniqueInput = { subscriptionId }
    const prismaRegistration = await this.prisma.tenantRegistration.findUnique({
      where
    })
    if (!prismaRegistration) return null
    return PrismaTenantRegistrationMapper.toDomain(prismaRegistration)
  }

  async findAll(
    filter: TenantRegistrationFilter,
    ctx: RequestContext
  ): Promise<TenantRegistration[]> {
    const where: Prisma.TenantRegistrationWhereInput = {}

    if (filter.state) {
      where.state = filter.state
    }
    if (filter.externalRef) {
      where.externalRef = filter.externalRef
    }
    if (filter.paymentId) {
      where.paymentId = filter.paymentId
    }
    if (filter.handoffTokenHash) {
      where.handoffTokenHash = filter.handoffTokenHash
    }

    const prismaRegistrations = await this.prisma.tenantRegistration.findMany({
      where
    })
    return prismaRegistrations.map((prismaRegistration) =>
      PrismaTenantRegistrationMapper.toDomain(prismaRegistration)
    )
  }

  async save(
    registration: TenantRegistration,
    ctx: RequestContext
  ): Promise<TenantRegistration> {
    const prismaRegistration =
      PrismaTenantRegistrationMapper.toPersistence(registration)
    await this.prisma.tenantRegistration.upsert({
      where: { id: registration.id.value },
      update: prismaRegistration,
      create: prismaRegistration
    })
    return registration
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    await this.prisma.tenantRegistration.delete({
      where: { id }
    })
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export { PrismaTenantRegistrationMapper as TenantRegistrationMapper }

class PrismaTenantRegistrationMapper {
  static toDomain(
    prismaRegistration: PrismaTenantRegistration
  ): TenantRegistration {
    return TenantRegistration.rehydrate({
      id: Id.from(prismaRegistration.id),
      externalRef: prismaRegistration.externalRef,
      state: prismaRegistration.state as RegistrationState,
      paymentId: prismaRegistration.paymentId,
      subscriptionId: prismaRegistration.subscriptionId,
      providerCustomerId: prismaRegistration.providerCustomerId ?? null,
      expiresAt: prismaRegistration.expiresAt,
      handoffTokenHash: prismaRegistration.handoffTokenHash,
      handoffTokenExpiresAt: prismaRegistration.handoffTokenExpiresAt,
      handoffTokenUsedAt: prismaRegistration.handoffTokenUsedAt,
      tenantData: prismaRegistration.tenantData as Json,
      tenantSiteData: prismaRegistration.tenantSiteData as Json,
      userData: prismaRegistration.userData as Json,
      identityData: prismaRegistration.identityData as Json,
      profileData: prismaRegistration.profileData as Json,
      provisionedUserId: prismaRegistration.provisionedUserId,
      provisionedTenantId: prismaRegistration.provisionedTenantId,
      provisionedMembershipId: prismaRegistration.provisionedMembershipId,
      provisionedProfileId: prismaRegistration.provisionedProfileId,
      provisionedIdentityId: prismaRegistration.provisionedIdentityId,
      provisionedTenantSiteId: prismaRegistration.provisionedTenantSiteId,
      paymentStatus: prismaRegistration.paymentStatus,
      paymentStatusDetail: prismaRegistration.paymentStatusDetail,
      webhookProcessedAt: prismaRegistration.webhookProcessedAt,
      approvedAt: prismaRegistration.approvedAt,
      provisionedAt: prismaRegistration.provisionedAt,
      rejectedAt: prismaRegistration.rejectedAt,
      expiredAt: prismaRegistration.expiredAt,
      createdAt: prismaRegistration.createdAt,
      updatedAt: prismaRegistration.updatedAt
    })
  }

  static toPersistence(
    registration: TenantRegistration
  ): Prisma.TenantRegistrationUncheckedCreateInput {
    return {
      id: registration.id.value,
      externalRef: registration.externalRef,
      state: registration.state,
      paymentId: registration.paymentId,
      subscriptionId: registration.subscriptionId,
      providerCustomerId: registration.providerCustomerId ?? null,
      expiresAt: registration.expiresAt,
      handoffTokenHash: registration.handoffTokenHash,
      handoffTokenExpiresAt: registration.handoffTokenExpiresAt,
      handoffTokenUsedAt: registration.handoffTokenUsedAt,
      tenantData: registration.tenantData as Prisma.InputJsonValue,
      tenantSiteData: registration.tenantSiteData as Prisma.InputJsonValue,
      userData: registration.userData as Prisma.InputJsonValue,
      identityData: registration.identityData as Prisma.InputJsonValue,
      profileData: registration.profileData as Prisma.InputJsonValue,
      provisionedUserId: registration.provisionedUserId,
      provisionedTenantId: registration.provisionedTenantId,
      provisionedMembershipId: registration.provisionedMembershipId,
      provisionedProfileId: registration.provisionedProfileId,
      provisionedIdentityId: registration.provisionedIdentityId,
      provisionedTenantSiteId: registration.provisionedTenantSiteId,
      paymentStatus: registration.paymentStatus,
      paymentStatusDetail: registration.paymentStatusDetail,
      webhookProcessedAt: registration.webhookProcessedAt,
      approvedAt: registration.approvedAt,
      provisionedAt: registration.provisionedAt,
      rejectedAt: registration.rejectedAt,
      expiredAt: registration.expiredAt,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt
    }
  }
}
