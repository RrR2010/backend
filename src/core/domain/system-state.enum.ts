export enum SystemState {
  ACTIVE = 'ACTIVE', // visible and can be modified
  LOCKED = 'LOCKED', // cannot be changed but is visible (audit purpose)
  HIDDEN = 'HIDDEN', // cannot be changed and is not visible (soft delete)
}
