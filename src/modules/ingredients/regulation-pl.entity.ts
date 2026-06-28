import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type RegulationPLProps = AuditableProps &
  LockableProps & {
    id: Id
    number: string
    year: number
    title: string | null
    publishedAt: Date | null
    regulatoryBodyId: string
    regulationTypeId: string
  }

export type CreateRegulationPLProps = Omit<
  RegulationPLProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class Regulation_PL extends Lockable(
  Auditable(Base<RegulationPLProps>)
) {
  protected constructor(props: RegulationPLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateRegulationPLProps): Regulation_PL {
    const now = new Date()

    return new Regulation_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: RegulationPLProps): Regulation_PL {
    return new Regulation_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get number(): string {
    return this._props.number
  }

  get year(): number {
    return this._props.year
  }

  get title(): string | null {
    return this._props.title
  }

  get publishedAt(): Date | null {
    return this._props.publishedAt
  }

  get regulatoryBodyId(): string {
    return this._props.regulatoryBodyId
  }

  get regulationTypeId(): string {
    return this._props.regulationTypeId
  }

  // --------------- Behaviors ---------------

  changeNumber(number: string): void {
    this.ensureActivated('Regulation_PL')
    this._props.number = number
    this.touch()
  }

  changeYear(year: number): void {
    this.ensureActivated('Regulation_PL')
    this._props.year = year
    this.touch()
  }

  changeTitle(title: string | null): void {
    this.ensureActivated('Regulation_PL')
    this._props.title = title
    this.touch()
  }

  changePublishedAt(publishedAt: Date | null): void {
    this.ensureActivated('Regulation_PL')
    this._props.publishedAt = publishedAt
    this.touch()
  }

  changeRegulatoryBodyId(regulatoryBodyId: string): void {
    this.ensureActivated('Regulation_PL')
    this._props.regulatoryBodyId = regulatoryBodyId
    this.touch()
  }

  changeRegulationTypeId(regulationTypeId: string): void {
    this.ensureActivated('Regulation_PL')
    this._props.regulationTypeId = regulationTypeId
    this.touch()
  }
}
