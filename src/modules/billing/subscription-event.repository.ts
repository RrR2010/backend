import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { SubscriptionEvent } from '@billing/subscription-event.entity'
import {
  SubscriptionEvent as PrismaSubscriptionEvent,
  Prisma
} from '@prisma/client'
import { Id } from '@shared/value-objects'
import { Json } from '@shared/types'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export interface SubscriptionEventFilter {
  subscriptionId?: string
  providerEventId?: string
  providerEventType?: string
}

export abstract class SubscriptionEventRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<SubscriptionEvent | null>
  abstract findByProviderEventId(
    providerEventId: string,
    ctx: RequestContext
  ): Promise<SubscriptionEvent | null>
  abstract findBySubscriptionId(
    subscriptionId: string,
    ctx: RequestContext
  ): Promise<SubscriptionEvent[]>
  abstract findLatestBySubscriptionId(
    subscriptionId: string,
    ctx: RequestContext
  ): Promise<SubscriptionEvent | null>
  abstract findAll(
    filter: SubscriptionEventFilter,
    ctx: RequestContext
  ): Promise<SubscriptionEvent[]>
  abstract save(
    event: SubscriptionEvent,
    ctx: RequestContext
  ): Promise<SubscriptionEvent>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaSubscriptionEventRepository implements SubscriptionEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<SubscriptionEvent | null> {
    // Tenant filtering via subscription relationship
    if (ctx.scope === UserScope.TENANT) {
      const prismaEvent = await this.prisma.subscriptionEvent.findFirst({
        where: {
          id,
          subscription: { tenantId: ctx.tenantId }
        }
      })
      if (!prismaEvent) return null
      return SubscriptionEventMapper.toDomain(prismaEvent)
    }

    const prismaEvent = await this.prisma.subscriptionEvent.findUnique({
      where: { id }
    })
    if (!prismaEvent) return null
    return SubscriptionEventMapper.toDomain(prismaEvent)
  }

  async findByProviderEventId(
    providerEventId: string,
    ctx: RequestContext
  ): Promise<SubscriptionEvent | null> {
    // Tenant filtering via subscription relationship
    if (ctx.scope === UserScope.TENANT) {
      const prismaEvent = await this.prisma.subscriptionEvent.findFirst({
        where: {
          providerEventId,
          subscription: { tenantId: ctx.tenantId }
        }
      })
      if (!prismaEvent) return null
      return SubscriptionEventMapper.toDomain(prismaEvent)
    }

    const prismaEvent = await this.prisma.subscriptionEvent.findUnique({
      where: { providerEventId }
    })
    if (!prismaEvent) return null
    return SubscriptionEventMapper.toDomain(prismaEvent)
  }

  async findBySubscriptionId(
    subscriptionId: string,
    ctx: RequestContext
  ): Promise<SubscriptionEvent[]> {
    // Tenant filtering - verify subscription belongs to tenant
    if (ctx.scope === UserScope.TENANT) {
      const subscription = await this.prisma.subscription.findFirst({
        where: { id: subscriptionId, tenantId: ctx.tenantId }
      })
      if (!subscription) return []
    }

    const prismaEvents = await this.prisma.subscriptionEvent.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' }
    })
    return prismaEvents.map((event) => SubscriptionEventMapper.toDomain(event))
  }

  async findLatestBySubscriptionId(
    subscriptionId: string,
    ctx: RequestContext
  ): Promise<SubscriptionEvent | null> {
    // Tenant filtering - verify subscription belongs to tenant
    if (ctx.scope === UserScope.TENANT) {
      const subscription = await this.prisma.subscription.findFirst({
        where: { id: subscriptionId, tenantId: ctx.tenantId }
      })
      if (!subscription) return null
    }

    const prismaEvent = await this.prisma.subscriptionEvent.findFirst({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
      take: 1
    })
    if (!prismaEvent) return null
    return SubscriptionEventMapper.toDomain(prismaEvent)
  }

  async findAll(
    filter: SubscriptionEventFilter,
    ctx: RequestContext
  ): Promise<SubscriptionEvent[]> {
    const where: Prisma.SubscriptionEventWhereInput = {}

    // Tenant filtering via subscription relationship
    if (ctx.scope === UserScope.TENANT) {
      where.subscription = { tenantId: ctx.tenantId }
    }

    if (filter.subscriptionId) {
      where.subscriptionId = filter.subscriptionId
    }
    if (filter.providerEventId) {
      where.providerEventId = filter.providerEventId
    }
    if (filter.providerEventType) {
      where.providerEventType = filter.providerEventType
    }

    const prismaEvents = await this.prisma.subscriptionEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    return prismaEvents.map((event) => SubscriptionEventMapper.toDomain(event))
  }

  async save(
    event: SubscriptionEvent,
    ctx: RequestContext
  ): Promise<SubscriptionEvent> {
    // Tenant filtering - verify subscription belongs to tenant
    if (ctx.scope === UserScope.TENANT) {
      const subscription = await this.prisma.subscription.findFirst({
        where: { id: event.subscriptionId, tenantId: ctx.tenantId }
      })
      if (!subscription) {
        throw new Error(
          'Cannot create event for subscription of another tenant'
        )
      }
    }

    const prismaEvent = SubscriptionEventMapper.toPersistence(event)
    await this.prisma.subscriptionEvent.create({
      data: prismaEvent
    })
    return event
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    // Tenant filtering via subscription relationship
    if (ctx.scope === UserScope.TENANT) {
      await this.prisma.subscriptionEvent.deleteMany({
        where: {
          id,
          subscription: { tenantId: ctx.tenantId }
        }
      })
      return
    }
    await this.prisma.subscriptionEvent.delete({ where: { id } })
  }
}

export { SubscriptionEventMapper as SubscriptionEventRepositoryMapper }

class SubscriptionEventMapper {
  static toDomain(prismaEvent: PrismaSubscriptionEvent): SubscriptionEvent {
    return SubscriptionEvent.rehydrate({
      id: Id.from(prismaEvent.id),
      subscriptionId: prismaEvent.subscriptionId,
      providerEventId: prismaEvent.providerEventId ?? null,
      providerEventType: prismaEvent.providerEventType,
      statusBefore: prismaEvent.statusBefore ?? null,
      statusAfter: prismaEvent.statusAfter ?? null,
      payload: prismaEvent.payload as Json,
      createdAt: prismaEvent.createdAt
    })
  }

  static toPersistence(
    event: SubscriptionEvent
  ): Prisma.SubscriptionEventUncheckedCreateInput {
    return {
      id: event.id.value,
      subscriptionId: event.subscriptionId,
      providerEventId: event.providerEventId ?? null,
      providerEventType: event.providerEventType,
      statusBefore: event.statusBefore ?? null,
      statusAfter: event.statusAfter ?? null,
      payload: event.payload as Prisma.InputJsonValue,
      createdAt: event.createdAt
    }
  }
}
