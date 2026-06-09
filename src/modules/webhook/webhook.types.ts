export interface AsaasWebhookPayload {
  event:
    | 'PAYMENT_CONFIRMED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_OVERDUE'
    | 'PAYMENT_REFUNDED'
    | 'SUBSCRIPTION_CREATED'
    | 'SUBSCRIPTION_UPDATED'
    | 'SUBSCRIPTION_INACTIVATED'
  payment?: {
    id: string
    subscription: string
    value: number
    netValue?: number
    status?: string
    dueDate?: string
    billingType?: string
    invoiceUrl?: string
  }
  subscription?: {
    id: string
    status?: string
    cycle?: string
    value?: number
    nextDueDate?: string
  }
}

export type AsaasWebhookEvent = AsaasWebhookPayload['event']
