import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type Claim_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    code: string
    name: string
    description: string | null
  }

export type CreateClaim_TEProps = Omit<
  Claim_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class Claim_TE extends Lockable(Auditable(Base<Claim_TEProps>)) {
  protected constructor(props: Claim_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateClaim_TEProps): Claim_TE {
    // TODO: zod validate input
    const now = new Date()

    return new Claim_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: Claim_TEProps): Claim_TE {
    return new Claim_TE(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get tenantId(): string {
    return this._props.tenantId
  }

  get code(): string {
    return this._props.code
  }

  get name(): string {
    return this._props.name
  }

  get description(): string | null {
    return this._props.description
  }

  // --------------- Behaviors ---------------

  changeCode(code: string): void {
    this.ensureActivated('Claim_TE')
    this._props.code = code
    this.touch()
  }

  changeName(name: string): void {
    this.ensureActivated('Claim_TE')
    this._props.name = name
    this.touch()
  }

  changeDescription(description: string | null): void {
    this.ensureActivated('Claim_TE')
    this._props.description = description
    this.touch()
  }
}
