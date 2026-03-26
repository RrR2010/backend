import { Id } from '@core/domain/id.vo';
import { EntityStatus } from './entity-status.enum';

export interface EntityProps {
  id: Id;
  entityStatus: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type MutableEntityProps<Props> = Omit<
  Props,
  'id' | 'createdAt' | 'updatedAt' | 'entityStatus'
>;

export abstract class Entity<Props extends EntityProps> {
  protected readonly _props: Props;

  protected constructor(props: Props) {
    this._props = props;
  }

  // --------------- Getters ---------------
  protected get props(): Readonly<Props> {
    return this._props;
  }

  get id(): Id {
    return this._props.id;
  }

  get entityStatus(): EntityStatus {
    return this._props.entityStatus;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  // --------------- Setters ---------------
  protected set<K extends keyof MutableEntityProps<Props>>(
    key: K,
    value: MutableEntityProps<Props>[K],
  ): void {
    this._props[key] = value;
    this.touch();
  }

  // --------------- Behaviours ---------------
  activate() {
    this._props.entityStatus = EntityStatus.ACTIVE;
    this.touch();
  }

  lock() {
    this._props.entityStatus = EntityStatus.LOCKED;
    this.touch();
  }

  hide() {
    this._props.entityStatus = EntityStatus.HIDDEN;
    this.touch();
  }

  ensureNotLocked() {
    if (this._props.entityStatus === EntityStatus.LOCKED) {
      throw new Error('Entity is locked');
    }
  }

  // --------------- Internal Methods ---------------
  protected touch() {
    this._props.updatedAt = new Date();
  }
}
