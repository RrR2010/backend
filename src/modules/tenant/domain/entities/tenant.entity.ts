import { Entity, EntityProps } from '@core/domain/entities/entity';
import { Id } from '@core/domain/value-objects/id.vo';

interface TenantProps extends Omit<EntityProps, 'tenant'> {
  name: string;
}

interface CreateTenantProps extends Omit<
  TenantProps,
  'id' | 'createdAt' | 'updatedAt'
> {
  name: string;
}

export class Tenant extends Entity<Readonly<TenantProps>> {
  private constructor(props: Readonly<TenantProps>) {
    super(props);
  }

  static create(params: CreateTenantProps): Tenant {
    const now = new Date();
    const tenant = new Tenant({
      id: Id.generate(),
      name: params.name,
      createdAt: now,
      updatedAt: now,
    });
    return tenant;
  }
}
