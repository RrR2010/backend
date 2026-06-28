import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type PanelGeometricFormatTypePLProps = AuditableProps &
  LockableProps & {
    id: Id
    formatName: string
    valueFields: Record<string, unknown> | null
    calculationFormula: string | null
  }

export type CreatePanelGeometricFormatTypePLProps = Omit<
  PanelGeometricFormatTypePLProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class PanelGeometricFormatType_PL extends Lockable(
  Auditable(Base<PanelGeometricFormatTypePLProps>)
) {
  protected constructor(props: PanelGeometricFormatTypePLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(
    props: CreatePanelGeometricFormatTypePLProps
  ): PanelGeometricFormatType_PL {
    const now = new Date()

    return new PanelGeometricFormatType_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(
    props: PanelGeometricFormatTypePLProps
  ): PanelGeometricFormatType_PL {
    return new PanelGeometricFormatType_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get formatName(): string {
    return this._props.formatName
  }

  get valueFields(): Record<string, unknown> | null {
    return this._props.valueFields
  }

  get calculationFormula(): string | null {
    return this._props.calculationFormula
  }

  // --------------- Behaviors ---------------

  changeFormatName(formatName: string): void {
    this.ensureActivated('PanelGeometricFormatType_PL')
    this._props.formatName = formatName
    this.touch()
  }

  changeValueFields(valueFields: Record<string, unknown> | null): void {
    this.ensureActivated('PanelGeometricFormatType_PL')
    this._props.valueFields = valueFields
    this.touch()
  }

  changeCalculationFormula(calculationFormula: string | null): void {
    this.ensureActivated('PanelGeometricFormatType_PL')
    this._props.calculationFormula = calculationFormula
    this.touch()
  }
}
