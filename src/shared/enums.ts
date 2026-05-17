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

// ============== SYSTEM ENUMS ==============

export enum SystemState {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  HIDDEN = 'HIDDEN'
}
