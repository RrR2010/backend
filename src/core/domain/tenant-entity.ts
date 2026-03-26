import { Entity, EntityProps } from '@core/domain/entity';
import { Id } from '@core/domain/id.vo';

export interface TenantEntityProps extends EntityProps {
  tenantId: Id;
}

export abstract class TenantEntity<
  Props extends TenantEntityProps,
> extends Entity<Props> {
  protected constructor(props: Props) {
    super(props);
  }

  // --------------- Getters ---------------

  get tenantId(): Id {
    return this._props.tenantId;
  }

  // --------------- Behaviours ---------------
  protected ensureSameTenant(other: TenantEntity<any>): void {
    if (!other) {
      throw new Error('Other entity cannot be null');
    }
    if (!this.tenantId.equals(other.tenantId)) {
      throw new Error('Cross tenant operation not allowed');
    }
  }
}
