import { Id } from '@shared/value-objects'
import { Json } from '@shared/types'

export interface SubscriptionEventProps {
  id: Id
  subscriptionId: string
  providerEventId: string | null
  providerEventType: string
  statusBefore: string | null
  statusAfter: string | null
  payload: Json
  createdAt: Date
}

export class SubscriptionEvent {
  readonly id: Id
  readonly subscriptionId: string
  readonly providerEventId: string | null
  readonly providerEventType: string
  readonly statusBefore: string | null
  readonly statusAfter: string | null
  readonly payload: Json
  readonly createdAt: Date

  private constructor(props: SubscriptionEventProps) {
    this.id = props.id
    this.subscriptionId = props.subscriptionId
    this.providerEventId = props.providerEventId
    this.providerEventType = props.providerEventType
    this.statusBefore = props.statusBefore
    this.statusAfter = props.statusAfter
    this.payload = props.payload
    this.createdAt = props.createdAt
  }

  // TODO: zod validate input
  static create(
    props: Omit<SubscriptionEventProps, 'id' | 'createdAt'>
  ): SubscriptionEvent {
    return new SubscriptionEvent({
      id: Id.generate(),
      ...props,
      createdAt: new Date()
    })
  }

  static rehydrate(props: SubscriptionEventProps): SubscriptionEvent {
    return new SubscriptionEvent(props)
  }

  isPaymentEvent(): boolean {
    return this.providerEventType.startsWith('payment')
  }

  isSubscriptionEvent(): boolean {
    return this.providerEventType.startsWith('subscription')
  }

  isStatusChange(): boolean {
    return this.statusBefore !== null && this.statusAfter !== null
  }
}
