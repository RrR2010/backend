import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'


export type IngredientTechnicalProfileProps = AuditableProps & LockableProps & {
  id: Id
  tenantId: string
  ingredientId: string
  pac: number | null
  pod: number | null
  totalSolids: number | null
  ashContent: number | null
}

export type CreateIngredientTechnicalProfileProps = Omit<IngredientTechnicalProfileProps, keyof AuditableProps | keyof LockableProps | 'id'>

export class IngredientTechnicalProfile extends Lockable(Auditable(Base<IngredientTechnicalProfileProps>)) {
  protected constructor(props: IngredientTechnicalProfileProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIngredientTechnicalProfileProps): IngredientTechnicalProfile {
    // TODO: zod validate input
    const now = new Date()
    return new IngredientTechnicalProfile({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: IngredientTechnicalProfileProps): IngredientTechnicalProfile {
    return new IngredientTechnicalProfile(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get tenantId(): string {
    return this._props.tenantId
  }

  get ingredientId(): string {
    return this._props.ingredientId
  }

  get pac(): number | null {
    return this._props.pac
  }

  get pod(): number | null {
    return this._props.pod
  }

  get totalSolids(): number | null {
    return this._props.totalSolids
  }

  get ashContent(): number | null {
    return this._props.ashContent
  }

  // --------------- Behaviors ---------------

  changePac(pac: number | null): void {
    this.ensureActivated('IngredientTechnicalProfile')
    this._props.pac = pac
    this.touch()
  }

  changePod(pod: number | null): void {
    this.ensureActivated('IngredientTechnicalProfile')
    this._props.pod = pod
    this.touch()
  }

  changeTotalSolids(totalSolids: number | null): void {
    this.ensureActivated('IngredientTechnicalProfile')
    this._props.totalSolids = totalSolids
    this.touch()
  }

  changeAshContent(ashContent: number | null): void {
    this.ensureActivated('IngredientTechnicalProfile')
    this._props.ashContent = ashContent
    this.touch()
  }

  activate(): void {
    this.ensureActivated('IngredientTechnicalProfile')
    super.activate()
  }
}
