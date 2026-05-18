export interface PaymentItem {
  title: string
  quantity: number
  unitPrice: number
  currency?: string // default: 'BRL'
}

export interface PaymentPreference {
  items: PaymentItem[]
  externalReference: string
  backUrls: {
    success: string
    pending: string
    failure: string
  }
  notificationUrl: string
  payer?: {
    email: string
    name: string
  }
}

export interface PaymentPreferenceResult {
  preferenceId: string
  initPoint: string // Production URL
  sandboxInitPoint: string // Sandbox URL
}

export interface PaymentNotification {
  paymentId: string
  externalReference: string
  status: 'approved' | 'pending' | 'rejected' | 'cancelled'
  statusDetail: string
}

export interface WebhookHeaders {
  'x-signature': string
  'x-request-id': string
}
