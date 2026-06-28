import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type ComplianceRulePLProps = AuditableProps &
  LockableProps & {
    id: Id
    code: string
    category: string
    ruleType: string
    description: string
    condition: Record<string, unknown> | null
    severity: string
    regulationId: string
    nutrientId: string | null
  }

export type CreateComplianceRulePLProps = Omit<
  ComplianceRulePLProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class ComplianceRule_PL extends Lockable(
  Auditable(Base<ComplianceRulePLProps>)
) {
  protected constructor(props: ComplianceRulePLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateComplianceRulePLProps): ComplianceRule_PL {
    const now = new Date()

    return new ComplianceRule_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: ComplianceRulePLProps): ComplianceRule_PL {
    return new ComplianceRule_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get code(): string {
    return this._props.code
  }

  get category(): string {
    return this._props.category
  }

  get ruleType(): string {
    return this._props.ruleType
  }

  get description(): string {
    return this._props.description
  }

  get condition(): Record<string, unknown> | null {
    return this._props.condition
  }

  get severity(): string {
    return this._props.severity
  }

  get regulationId(): string {
    return this._props.regulationId
  }

  get nutrientId(): string | null {
    return this._props.nutrientId
  }

  // --------------- Behaviors ---------------

  changeCode(code: string): void {
    this.ensureActivated('ComplianceRule_PL')
    this._props.code = code
    this.touch()
  }

  changeCategory(category: string): void {
    this.ensureActivated('ComplianceRule_PL')
    this._props.category = category
    this.touch()
  }

  changeRuleType(ruleType: string): void {
    this.ensureActivated('ComplianceRule_PL')
    this._props.ruleType = ruleType
    this.touch()
  }

  changeDescription(description: string): void {
    this.ensureActivated('ComplianceRule_PL')
    this._props.description = description
    this.touch()
  }

  changeCondition(condition: Record<string, unknown> | null): void {
    this.ensureActivated('ComplianceRule_PL')
    this._props.condition = condition
    this.touch()
  }

  changeSeverity(severity: string): void {
    this.ensureActivated('ComplianceRule_PL')
    this._props.severity = severity
    this.touch()
  }

  changeRegulationId(regulationId: string): void {
    this.ensureActivated('ComplianceRule_PL')
    this._props.regulationId = regulationId
    this.touch()
  }

  changeNutrientId(nutrientId: string | null): void {
    this.ensureActivated('ComplianceRule_PL')
    this._props.nutrientId = nutrientId
    this.touch()
  }
}
