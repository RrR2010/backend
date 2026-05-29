import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { DocumentType } from '@shared/enums'

export type MemberProfileDocumentProps = AuditableProps &
  LockableProps & {
    id: Id
    memberProfileId: string
    type: DocumentType
    value: string
    normalizedValue: string
  }

export type CreateMemberProfileDocumentProps = Omit<
  MemberProfileDocumentProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class MemberProfileDocument extends Lockable(
  Auditable(Base<MemberProfileDocumentProps>)
) {
  protected constructor(props: MemberProfileDocumentProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(
    props: CreateMemberProfileDocumentProps
  ): MemberProfileDocument {
    const now = new Date()
    return new MemberProfileDocument({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: MemberProfileDocumentProps): MemberProfileDocument {
    return new MemberProfileDocument(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  // --------------- Getters ---------------

  get memberProfileId(): string {
    return this._props.memberProfileId
  }

  get type(): DocumentType {
    return this._props.type
  }

  get value(): string {
    return this._props.value
  }

  get normalizedValue(): string {
    return this._props.normalizedValue
  }

  // --------------- Behaviour Methods ---------------

  changeValue(value: string, normalizedValue: string): void {
    this.ensureActivated('MemberProfileDocument')
    this._props.value = value
    this._props.normalizedValue = normalizedValue
    this.touch()
  }
}
