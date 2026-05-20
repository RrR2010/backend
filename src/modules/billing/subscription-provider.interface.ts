import {
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  UpdateSubscriptionInput,
  ProviderSubscriptionSnapshot
} from '@billing/subscription-provider.types'

export interface SubscriptionProvider {
  readonly name: string

  createSubscription(
    input: CreateSubscriptionInput
  ): Promise<CreateSubscriptionResult>

  updateSubscription(input: UpdateSubscriptionInput): Promise<void>

  cancelSubscription(
    providerSubscriptionId: string,
    cancelAtPeriodEnd: boolean
  ): Promise<void>

  pauseSubscription(providerSubscriptionId: string): Promise<void>

  resumeSubscription(providerSubscriptionId: string): Promise<void>

  getSubscription(
    providerSubscriptionId: string
  ): Promise<ProviderSubscriptionSnapshot>

  validateWebhookSignature(
    headers: Record<string, string>,
    body: unknown
  ): boolean
}
