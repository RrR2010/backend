import { Base, Constructor } from '@shared/base-entity'
import {
  EntityLockedError,
  EntityDeletedError,
  EntityNotLockedError
} from '@shared/errors/entity-state.errors'

export enum SystemState {
  ACTIVE = 'ACTIVE', // visible and can be modified
  LOCKED = 'LOCKED', // cannot be changed but is visible (audit purpose)
  DELETED = 'DELETED'
}

/**
 * Props required by the Lockable capability.
 */
export type LockableProps = {
  systemState: SystemState
}

/**
 * Public API exposed by the mixin.
 */
export type LockableMethods = {
  readonly systemState: SystemState

  activate(): void
  lock(): void
  delete(): void
  unlock(): void

  ensureActivated(entityType?: string): void
}

/**
 * Optional contract used internally.
 * If another mixin (like Auditable) provides touch(),
 * Lockable will call it automatically.
 */
type Touchable = {
  touch?(): void
}

/**
 * Lockable capability mixin.
 *
 * Adds:
 * - state getter
 * - activate()
 * - lock()
 * - delete()
 * - unlock()
 * - ensureActivated()
 *
 * Requires:
 * - props.systemState
 */
export function Lockable<
  Props extends LockableProps,
  TBase extends Constructor<Base<Props>>
>(BaseClass: TBase): Constructor<LockableMethods> & TBase {
  abstract class LockableMixin
    extends BaseClass
    implements LockableMethods, Touchable
  {
    get systemState(): SystemState {
      return this._props.systemState
    }

    activate(): void {
      this._props.systemState = SystemState.ACTIVE
      this.touch?.()
    }

    lock(): void {
      this._props.systemState = SystemState.LOCKED
      this.touch?.()
    }

    delete(): void {
      this._props.systemState = SystemState.DELETED
      this.touch?.()
    }

    unlock(): void {
      if (this.systemState !== SystemState.LOCKED) {
        throw new EntityNotLockedError('Entity')
      }
      this._props.systemState = SystemState.ACTIVE
      this.touch?.()
    }

    ensureActivated(entityType = 'Entity'): void {
      if (this.systemState === SystemState.LOCKED) {
        throw new EntityLockedError(entityType)
      }

      if (this.systemState === SystemState.DELETED) {
        throw new EntityDeletedError(entityType)
      }
    }

    declare touch?: () => void
  }

  return LockableMixin as Constructor<LockableMethods> & TBase
}
