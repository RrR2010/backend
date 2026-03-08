import { Id } from '@core/domain/value-objects/id.vo';

export interface EntityProps {
  id: Id;
  createdAt: Date;
  updatedAt: Date;
  tenantId: Id;
}

export abstract class Entity<Props extends object> {
  protected readonly props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }
}
