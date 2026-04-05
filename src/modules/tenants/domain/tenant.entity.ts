import { CreateEntityProps, Entity, EntityProps } from '@core/domain/entity';
import { SystemState } from '@core/domain/system-state.enum';
import { Id } from '@core/domain/id.vo';

type TenantProps = EntityProps & {
  name: string;
};

type CreateTenantProps = CreateEntityProps<TenantProps> & {
  name: string;
};

export type TenantSimpleProps = Pick<TenantProps, 'id' | 'name'>;

export class Tenant extends Entity<TenantProps> {
  private constructor(props: TenantProps) {
    super(props);
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateTenantProps): Tenant {
    const now = new Date();
    const tenant = new Tenant({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE,
      name: props.name,
    });
    return tenant;
  }

  static rehydrate(props: TenantProps): Tenant {
    return new Tenant(props);
  }

  // --------------- Getters ---------------
  get name(): string {
    return this._props.name;
  }

  get simpleStructure(): TenantSimpleProps {
    return {
      id: this._props.id,
      name: this._props.name,
    };
  }

  // --------------- Behaviours ---------------
  changeName(newName: string) {
    if (this._props.name === newName) return;
    this._props.name = newName;
    this._touch();
  }

  // --------------- Private Methods ---------------
}
