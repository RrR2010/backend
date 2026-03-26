export enum EntityStatus {
  ACTIVE = 'ACTIVE', // follows the business logic
  LOCKED = 'LOCKED', // cannot be changed but is visible
  HIDDEN = 'HIDDEN', // cannot be changed and is not visible - used for soft delete
}
