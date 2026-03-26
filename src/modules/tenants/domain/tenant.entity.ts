import { Entity, EntityProps } from '@core/domain/entity';
import { EntityStatus } from '@core/domain/entity-status.enum';
import { Id } from '@core/domain/id.vo';

interface TenantProps extends EntityProps {
  name: string;
}

interface CreateTenantProps extends Omit<
  TenantProps,
  'id' | 'createdAt' | 'updatedAt' | 'entityStatus'
> {
  name: string;
}

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
      entityStatus: EntityStatus.ACTIVE,
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

  changeName(newName: string) {
    if (this._props.name === newName) return;
    this._props.name = newName;
    this.touch();
  }

  // --------------- Private Methods ---------------
}
