import { Id } from '@core/domain/id.vo';

export interface EntityProps {
  id: Id;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class Entity<Props extends EntityProps> {
  protected readonly props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }

  // --------------- Getters ---------------
  get id(): Id {
    return this.props.id;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
