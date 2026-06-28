import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type LabelFieldPLProps = AuditableProps &
  LockableProps & {
    id: Id
    fieldName: string
    sortOrder: number
  }

export type CreateLabelFieldPLProps = Omit<
  LabelFieldPLProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class LabelField_PL extends Lockable(
  Auditable(Base<LabelFieldPLProps>)
) {
  protected constructor(props: LabelFieldPLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateLabelFieldPLProps): LabelField_PL {
    const now = new Date()

    return new LabelField_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: LabelFieldPLProps): LabelField_PL {
    return new LabelField_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get fieldName(): string {
    return this._props.fieldName
  }

  get sortOrder(): number {
    return this._props.sortOrder
  }

  // --------------- Behaviors ---------------

  changeFieldName(fieldName: string): void {
    this.ensureActivated('LabelField_PL')
    this._props.fieldName = fieldName
    this.touch()
  }

  changeSortOrder(sortOrder: number): void {
    this.ensureActivated('LabelField_PL')
    this._props.sortOrder = sortOrder
    this.touch()
  }
}
