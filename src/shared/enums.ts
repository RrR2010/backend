// ============== POLYMORPHIC RELATION ENUMS ==============

export enum OwnerType {
  MEMBER_PROFILE = 'MemberProfile',
  TENANT_SITE = 'TenantSite'
}

export enum AddressType {
  HOME = 'HOME',
  WORK = 'WORK',
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING'
}

export enum PhoneType {
  MOBILE = 'MOBILE',
  HOME = 'HOME',
  WORK = 'WORK',
  WHATSAPP = 'WHATSAPP'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum DocumentType {
  RG = 'RG',
  CPF = 'CPF',
  CNPJ = 'CNPJ',
  CNH = 'CNH',
  PASSPORT = 'PASSPORT'
}

// ============== TENANT SITE ENUMS ==============

export enum TenantSiteType {
  FACTORY = 'FACTORY',
  WAREHOUSE = 'WAREHOUSE',
  OFFICE = 'OFFICE'
}

// ============== PROVIDER ENUMS ==============

export enum Provider {
  EMAIL = 'EMAIL',
  CPF = 'CPF'
}

// ============== BOOTSTRAP ENUMS ==============

export enum RegistrationState {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROVISIONING = 'PROVISIONING',
  PROVISIONED = 'PROVISIONED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

// ============== SUBSCRIPTION ENUMS ==============

export enum PlanType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  GRACE = 'GRACE',
  PAUSED = 'PAUSED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED'
}
