import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type FunctionalGroup_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    name: string
    code: string | null
    sortOrder: number
    isActive: boolean
  }

export type CreateFunctionalGroup_TEProps = Omit<
  FunctionalGroup_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class FunctionalGroup_TE extends Lockable(
  Auditable(Base<FunctionalGroup_TEProps>)
) {
  protected constructor(props: FunctionalGroup_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateFunctionalGroup_TEProps): FunctionalGroup_TE {
    // TODO: zod validate input
    const now = new Date()

    return new FunctionalGroup_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: FunctionalGroup_TEProps): FunctionalGroup_TE {
    return new FunctionalGroup_TE(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get tenantId(): string {
    return this._props.tenantId
  }

  get name(): string {
    return this._props.name
  }

  get code(): string | null {
    return this._props.code
  }

  get sortOrder(): number {
    return this._props.sortOrder
  }

  get isActive(): boolean {
    return this._props.isActive
  }

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this.ensureActivated('FunctionalGroup_TE')
    this._props.name = name
    this.touch()
  }

  changeCode(code: string | null): void {
    this.ensureActivated('FunctionalGroup_TE')
    this._props.code = code
    this.touch()
  }

  changeSortOrder(sortOrder: number): void {
    this.ensureActivated('FunctionalGroup_TE')
    this._props.sortOrder = sortOrder
    this.touch()
  }

  toggleActive(): void {
    this.ensureActivated('FunctionalGroup_TE')
    this._props.isActive = !this._props.isActive
    this.touch()
  }

  setActive(): void {
    this.ensureActivated('FunctionalGroup_TE')
    if (this._props.isActive) return
    this._props.isActive = true
    this.touch()
  }

  setInactive(): void {
    this.ensureActivated('FunctionalGroup_TE')
    if (!this._props.isActive) return
    this._props.isActive = false
    this.touch()
  }

  // Dual-activation design: systemState (Lockable) controls visibility,
  // isActive (domain field) controls business availability.
  // Both are kept in sync: activate/lock/delete update both fields.
  // Locked entities cannot be reactivated — requires unlock first.
  activate(): void {
    this.ensureActivated('FunctionalGroup_TE')
    this._props.isActive = true
    super.activate()
  }

  lock(): void {
    this._props.isActive = false
    super.lock()
  }

  delete(): void {
    this._props.isActive = false
    super.delete()
  }
}
