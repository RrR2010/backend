import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Subscription } from '@billing/subscription.entity'
import { Subscription as PrismaSubscription, Prisma } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { SubscriptionStatus, PlanType } from '@shared/enums'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export interface SubscriptionFilter {
  tenantId?: string
  status?: SubscriptionStatus
  planType?: PlanType
}

export interface PaginationOptions {
  skip?: number
  take?: number
}

export abstract class SubscriptionRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<Subscription | null>
  abstract findByTenantId(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription | null>
  abstract findByProviderSubscriptionId(
    providerSubscriptionId: string,
    ctx: RequestContext
  ): Promise<Subscription | null>
  abstract findAll(
    filter: SubscriptionFilter,
    ctx: RequestContext,
    pagination?: PaginationOptions
  ): Promise<Subscription[]>
  abstract save(
    subscription: Subscription,
    ctx: RequestContext
  ): Promise<Subscription>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<Subscription | null> {
    // Tenant filtering
    if (ctx.scope === UserScope.TENANT) {
      const prismaSubscription = await this.prisma.subscription.findFirst({
        where: { id, tenantId: ctx.tenantId }
      })
      if (!prismaSubscription) return null
      return SubscriptionMapper.toDomain(prismaSubscription)
    }

    const prismaSubscription = await this.prisma.subscription.findUnique({
      where: { id }
    })
    if (!prismaSubscription) return null
    return SubscriptionMapper.toDomain(prismaSubscription)
  }

  async findByTenantId(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription | null> {
    // Tenant filtering
    if (ctx.scope === UserScope.TENANT && tenantId !== ctx.tenantId) {
      return null
    }

    const prismaSubscription = await this.prisma.subscription.findUnique({
      where: { tenantId }
    })
    if (!prismaSubscription) return null
    return SubscriptionMapper.toDomain(prismaSubscription)
  }

  async findByProviderSubscriptionId(
    providerSubscriptionId: string,
    ctx: RequestContext
  ): Promise<Subscription | null> {
    // Tenant filtering - need to join with subscription to check tenant
    if (ctx.scope === UserScope.TENANT) {
      const prismaSubscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId, tenantId: ctx.tenantId }
      })
      if (!prismaSubscription) return null
      return SubscriptionMapper.toDomain(prismaSubscription)
    }

    const prismaSubscription = await this.prisma.subscription.findUnique({
      where: { providerSubscriptionId }
    })
    if (!prismaSubscription) return null
    return SubscriptionMapper.toDomain(prismaSubscription)
  }

  async findAll(
    filter: SubscriptionFilter,
    ctx: RequestContext,
    pagination?: PaginationOptions
  ): Promise<Subscription[]> {
    const where: Prisma.SubscriptionWhereInput = {}

    // Tenant filtering
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    } else if (filter.tenantId) {
      where.tenantId = filter.tenantId
    }

    if (filter.status) {
      where.status = filter.status
    }
    if (filter.planType) {
      where.planType = filter.planType
    }

    const findManyOptions: Prisma.SubscriptionFindManyArgs = { where }
    if (pagination?.skip !== undefined) {
      findManyOptions.skip = pagination.skip
    }
    if (pagination?.take !== undefined) {
      findManyOptions.take = pagination.take
    }
    const prismaSubscriptions =
      await this.prisma.subscription.findMany(findManyOptions)
    return prismaSubscriptions.map((subscription) =>
      SubscriptionMapper.toDomain(subscription)
    )
  }

  async save(
    subscription: Subscription,
    ctx: RequestContext
  ): Promise<Subscription> {
    // Tenant filtering - ensure tenant can only modify their own subscription
    if (
      ctx.scope === UserScope.TENANT &&
      subscription.tenantId !== ctx.tenantId
    ) {
      throw new Error('Cannot create subscription for another tenant')
    }

    const prismaSubscription = SubscriptionMapper.toPersistence(subscription)
    await this.prisma.subscription.upsert({
      where: { id: subscription.id.value },
      update: prismaSubscription,
      create: prismaSubscription
    })
    return subscription
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    // Tenant filtering
    if (ctx.scope === UserScope.TENANT) {
      await this.prisma.subscription.deleteMany({
        where: { id, tenantId: ctx.tenantId }
      })
      return
    }
    await this.prisma.subscription.delete({ where: { id } })
  }
}

export { SubscriptionMapper as SubscriptionRepositoryMapper }

class SubscriptionMapper {
  static toDomain(prismaSubscription: PrismaSubscription): Subscription {
    return Subscription.rehydrate({
      id: Id.from(prismaSubscription.id),
      tenantId: prismaSubscription.tenantId,
      planType: prismaSubscription.planType as PlanType,
      status: prismaSubscription.status as SubscriptionStatus,
      currency: prismaSubscription.currency,
      provider: prismaSubscription.provider,
      providerSubscriptionId: prismaSubscription.providerSubscriptionId,
      providerPreapprovalId: prismaSubscription.providerPreapprovalId ?? null,
      providerCustomerId: prismaSubscription.providerCustomerId ?? null,
      basePriceSnapshot: prismaSubscription.basePriceSnapshot,
      additionalUserPriceSnapshot:
        prismaSubscription.additionalUserPriceSnapshot ?? null,
      includedUsersSnapshot: prismaSubscription.includedUsersSnapshot,
      additionalUsers: prismaSubscription.additionalUsers,
      currentAmount: prismaSubscription.currentAmount,
      nextBillingAmount: prismaSubscription.nextBillingAmount ?? null,
      trialEndsAt: prismaSubscription.trialEndsAt ?? null,
      currentPeriodStart: prismaSubscription.currentPeriodStart ?? null,
      currentPeriodEnd: prismaSubscription.currentPeriodEnd ?? null,
      graceEndsAt: prismaSubscription.graceEndsAt ?? null,
      cancelAtPeriodEnd: prismaSubscription.cancelAtPeriodEnd,
      failedPaymentCount: prismaSubscription.failedPaymentCount,
      lastPaymentAt: prismaSubscription.lastPaymentAt ?? null,
      lastWebhookAt: prismaSubscription.lastWebhookAt ?? null,
      createdAt: prismaSubscription.createdAt,
      updatedAt: prismaSubscription.updatedAt
    })
  }

  static toPersistence(
    subscription: Subscription
  ): Prisma.SubscriptionUncheckedCreateInput {
    return {
      id: subscription.id.value,
      tenantId: subscription.tenantId,
      planType: subscription.planType,
      status: subscription.status,
      currency: subscription.currency,
      provider: subscription.provider,
      providerSubscriptionId: subscription.providerSubscriptionId,
      providerPreapprovalId: subscription.providerPreapprovalId ?? null,
      providerCustomerId: subscription.providerCustomerId ?? null,
      basePriceSnapshot: subscription.basePriceSnapshot,
      additionalUserPriceSnapshot:
        subscription.additionalUserPriceSnapshot ?? null,
      includedUsersSnapshot: subscription.includedUsersSnapshot,
      additionalUsers: subscription.additionalUsers,
      currentAmount: subscription.currentAmount,
      nextBillingAmount: subscription.nextBillingAmount ?? null,
      trialEndsAt: subscription.trialEndsAt ?? null,
      currentPeriodStart: subscription.currentPeriodStart ?? null,
      currentPeriodEnd: subscription.currentPeriodEnd ?? null,
      graceEndsAt: subscription.graceEndsAt ?? null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      failedPaymentCount: subscription.failedPaymentCount,
      lastPaymentAt: subscription.lastPaymentAt ?? null,
      lastWebhookAt: subscription.lastWebhookAt ?? null,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt
    }
  }
}
