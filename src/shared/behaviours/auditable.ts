import { Base, Constructor } from '@shared/base-entity'

export type AuditableProps = {
  createdAt: Date
  updatedAt: Date
}

type AuditableType = {
  createdAt: Date
  updatedAt: Date
  touch(): void
}

export function Auditable<
  Props extends AuditableProps,
  TBase extends Constructor<Base<Props>>
>(BaseClass: TBase): Constructor<AuditableType> & TBase {
  abstract class AuditableMixin extends BaseClass implements AuditableType {
    get createdAt(): Date {
      return this._props.createdAt
    }

    get updatedAt(): Date {
      return this._props.updatedAt
    }

    touch(): void {
      this._props.updatedAt = new Date()
    }
  }

  return AuditableMixin as Constructor<AuditableType> & TBase
}
