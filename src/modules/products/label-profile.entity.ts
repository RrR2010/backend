import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { LabelProfileStatus } from '@prisma/client'

export type LabelProfileProps = AuditableProps & {
  id: Id
  productId: string
  status: LabelProfileStatus
  designerData: Record<string, unknown> | null
  gerencialData: Record<string, unknown> | null
  approvedAt: Date | null
}

export type CreateLabelProfileProps = Omit<LabelProfileProps, keyof AuditableProps | 'id' | 'approvedAt'>

export class LabelProfile extends Auditable(Base<LabelProfileProps>) {
  protected constructor(props: LabelProfileProps) {
    super(props)
  }

  static create(props: CreateLabelProfileProps): LabelProfile {
    // TODO: zod validate input
    const now = new Date()
    return new LabelProfile({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      approvedAt: null,
    })
  }

  static rehydrate(props: LabelProfileProps): LabelProfile {
    return new LabelProfile(props)
  }

  get id(): Id { return this._props.id }
  get productId(): string { return this._props.productId }
  get status(): LabelProfileStatus { return this._props.status }
  get designerData(): Record<string, unknown> | null { return this._props.designerData }
  get gerencialData(): Record<string, unknown> | null { return this._props.gerencialData }
  get approvedAt(): Date | null { return this._props.approvedAt }

  submit(): void {
    this._props.status = LabelProfileStatus.SUBMITTED
    this.touch()
  }

  approve(): void {
    this._props.status = LabelProfileStatus.APPROVED
    this._props.approvedAt = new Date()
    this.touch()
  }

  updateDesignerData(data: Record<string, unknown> | null): void {
    this._props.designerData = data
    this.touch()
  }

  updateGerencialData(data: Record<string, unknown> | null): void {
    this._props.gerencialData = data
    this.touch()
  }
}
