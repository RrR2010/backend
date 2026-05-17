export const BOOTSTRAP_AUDIT_ACTIONS = {
  REGISTRATION_CREATED: 'bootstrap.registration.created',
  PREFERENCE_CREATED: 'bootstrap.preference.created',
  WEBHOOK_RECEIVED: 'bootstrap.webhook.received',
  WEBHOOK_SIGNATURE_INVALID: 'bootstrap.webhook.signature_invalid',
  PAYMENT_APPROVED: 'bootstrap.payment.approved',
  PROVISIONING_STARTED: 'bootstrap.provisioning.started',
  PROVISIONING_COMPLETED: 'bootstrap.provisioning.completed',
  PROVISIONING_FAILED: 'bootstrap.provisioning.failed',
  SESSION_CLAIMED: 'bootstrap.session.claimed',
  CLAIM_REJECTED: 'bootstrap.claim.rejected',
  REGISTRATION_EXPIRED: 'bootstrap.registration.expired',
  REGISTRATION_REJECTED: 'bootstrap.registration.rejected'
} as const
