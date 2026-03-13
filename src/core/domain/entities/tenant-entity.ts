import { Entity, EntityProps } from '@core/domain/entities/entity';
import { Id } from '@core/domain/value-objects/id.vo';

export interface TenantEntityProps extends EntityProps {
  tenantId: Id;
}

export abstract class TenantEntity<
  Props extends TenantEntityProps,
> extends Entity<Props> {
  // --------------- Getters ---------------
  get tenantId(): Id {
    return this.props.tenantId;
  }
}
