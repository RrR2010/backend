import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type OgmDonorSpeciesPLProps = AuditableProps &
  LockableProps & {
    id: Id
    scientificName: string
    commonName: string | null
    category: string | null
    createdBy: string | null
    updatedBy: string | null
  }

export type CreateOgmDonorSpeciesPLProps = Omit<
  OgmDonorSpeciesPLProps,
  keyof AuditableProps | keyof LockableProps | 'id' | 'createdBy' | 'updatedBy'
>

export class OgmDonorSpecies_PL extends Lockable(
  Auditable(Base<OgmDonorSpeciesPLProps>)
) {
  protected constructor(props: OgmDonorSpeciesPLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateOgmDonorSpeciesPLProps): OgmDonorSpecies_PL {
    const now = new Date()

    return new OgmDonorSpecies_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: OgmDonorSpeciesPLProps): OgmDonorSpecies_PL {
    return new OgmDonorSpecies_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get scientificName(): string {
    return this._props.scientificName
  }

  get commonName(): string | null {
    return this._props.commonName
  }

  get category(): string | null {
    return this._props.category
  }

  get createdBy(): string | null {
    return this._props.createdBy
  }

  get updatedBy(): string | null {
    return this._props.updatedBy
  }

  // --------------- Behaviors ---------------

  changeScientificName(scientificName: string): void {
    this.ensureActivated('OgmDonorSpecies_PL')
    this._props.scientificName = scientificName
    this.touch()
  }

  changeCommonName(commonName: string | null): void {
    this.ensureActivated('OgmDonorSpecies_PL')
    this._props.commonName = commonName
    this.touch()
  }

  changeCategory(category: string | null): void {
    this.ensureActivated('OgmDonorSpecies_PL')
    this._props.category = category
    this.touch()
  }
}
