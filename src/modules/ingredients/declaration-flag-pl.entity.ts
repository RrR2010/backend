import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { DeclarationFlagScope } from '@prisma/client'

export type DeclarationFlagPLProps = AuditableProps &
  LockableProps & {
    id: Id
    code: string
    name: string
    description: string | null
    appliesTo: DeclarationFlagScope
    createdBy: string | null
    updatedBy: string | null
  }

export type CreateDeclarationFlagPLProps = Omit<
  DeclarationFlagPLProps,
  keyof AuditableProps | keyof LockableProps | 'id' | 'createdBy' | 'updatedBy'
>

export class DeclarationFlag_PL extends Lockable(
  Auditable(Base<DeclarationFlagPLProps>)
) {
  protected constructor(props: DeclarationFlagPLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateDeclarationFlagPLProps): DeclarationFlag_PL {
    const now = new Date()

    return new DeclarationFlag_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: DeclarationFlagPLProps): DeclarationFlag_PL {
    return new DeclarationFlag_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
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

  get appliesTo(): DeclarationFlagScope {
    return this._props.appliesTo
  }

  get createdBy(): string | null {
    return this._props.createdBy
  }

  get updatedBy(): string | null {
    return this._props.updatedBy
  }

  // --------------- Behaviors ---------------

  changeCode(code: string): void {
    this.ensureActivated('DeclarationFlag_PL')
    this._props.code = code
    this.touch()
  }

  changeName(name: string): void {
    this.ensureActivated('DeclarationFlag_PL')
    this._props.name = name
    this.touch()
  }

  changeDescription(description: string | null): void {
    this.ensureActivated('DeclarationFlag_PL')
    this._props.description = description
    this.touch()
  }

  changeAppliesTo(appliesTo: DeclarationFlagScope): void {
    this.ensureActivated('DeclarationFlag_PL')
    this._props.appliesTo = appliesTo
    this.touch()
  }
}
