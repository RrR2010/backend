import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type ProductFamily_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    name: string
    description: string | null
  }

export type CreateProductFamily_TEProps = Omit<
  ProductFamily_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class ProductFamily_TE extends Lockable(
  Auditable(Base<ProductFamily_TEProps>)
) {
  protected constructor(props: ProductFamily_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateProductFamily_TEProps): ProductFamily_TE {
    // TODO: zod validate input
    const now = new Date()

    return new ProductFamily_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: ProductFamily_TEProps): ProductFamily_TE {
    return new ProductFamily_TE(props)
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

  get description(): string | null {
    return this._props.description
  }

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this.ensureActivated('ProductFamily_TE')
    this._props.name = name
    this.touch()
  }

  changeDescription(description: string | null): void {
    this.ensureActivated('ProductFamily_TE')
    this._props.description = description
    this.touch()
  }
}
