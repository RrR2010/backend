import { Entity, EntityProps } from '@core/domain/entity';
import { Id } from '@core/domain/id.vo';
import { TenantStatus } from '../enums/tenant-status';

interface TenantProps extends EntityProps {
  name: string;
  status: TenantStatus;
}

interface CreateTenantProps extends Omit<
  TenantProps,
  'id' | 'createdAt' | 'updatedAt' | 'status'
> {
  name: string;
}

export class Tenant extends Entity<TenantProps> {
  private constructor(props: TenantProps) {
    super(props);
  }

  // --------------- Factory Methods ---------------

  static create(params: CreateTenantProps): Tenant {
    const now = new Date();
    const tenant = new Tenant({
      id: Id.generate(),
      name: params.name,
      status: TenantStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    });
    return tenant;
  }

  static rehydrate(props: TenantProps): Tenant {
    return new Tenant(props);
  }

  // --------------- Getters ---------------
  get name(): string {
    return this.props.name;
  }

  get status(): TenantStatus {
    return this.props.status;
  }

  // --------------- Behaviors ---------------
  activate() {
    if (this.props.status === TenantStatus.ACTIVE) return;
    this.props.status = TenantStatus.ACTIVE;
    this.touch();
  }

  deactivate() {
    if (this.props.status === TenantStatus.INACTIVE) return;
    this.props.status = TenantStatus.INACTIVE;
    this.touch();
  }

  changeName(newName: string) {
    if (this.props.name === newName) return;
    this.props.name = newName;
    this.touch();
  }

  // --------------- Private Methods ---------------
  private touch() {
    this.props.updatedAt = new Date();
  }
}
