import { Id } from '@core/domain/id.vo';
import { SystemState } from './system-state.enum';

export type EntityProps = {
  id: Id;
  systemState: SystemState;
  createdAt: Date;
  updatedAt: Date;
};

export type MutableEntityProps<Props> = Omit<
  Props,
  'id' | 'createdAt' | 'updatedAt' | 'systemState'
>;

export type CreateEntityProps<Props> = Omit<
  Props,
  'id' | 'createdAt' | 'updatedAt' | 'systemState'
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

  get systemState(): SystemState {
    return this._props.systemState;
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
    this._touch();
  }

  // --------------- Behaviours ---------------
  activate() {
    this._props.systemState = SystemState.ACTIVE;
    this._touch();
  }

  lock() {
    this._props.systemState = SystemState.LOCKED;
    this._touch();
  }

  hide() {
    this._props.systemState = SystemState.HIDDEN;
    this._touch();
  }

  ensureNotLocked() {
    if (this._props.systemState === SystemState.LOCKED) {
      throw new Error('Entity is locked');
    }
  }

  // --------------- Internal Methods ---------------
  protected _touch() {
    this._props.updatedAt = new Date();
  }
}
