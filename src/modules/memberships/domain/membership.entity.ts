import { Entity, EntityProps, CreateEntityProps } from '@core/domain/entity';
import { SystemState } from '@core/domain/system-state.enum';
import { Id } from '@core/domain/id.vo';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

type MembershipProps = EntityProps & {
  userId: string;
  tenantId: string;
  roles: Role[];
};

type CreateMembershipProps = CreateEntityProps<MembershipProps> & {
  roles?: Role[];
};

export class Membership extends Entity<MembershipProps> {
  private constructor(props: MembershipProps) {
    super(props);
  }

  // --------------- Factory Methods ---------------
  static create(props: CreateMembershipProps): Membership {
    const now = new Date();
    const membership = new Membership({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE,
      roles: props.roles || [Role.USER],
    });
    return membership;
  }

  static rehydratate(params: MembershipProps): Membership {
    return new Membership(params);
  }

  // --------------- Getters ---------------
  get userId(): string {
    return this._props.userId;
  }

  get tenantId(): string {
    return this._props.tenantId;
  }

  get roles(): Role[] {
    return this._props.roles;
  }

  // --------------- Behaviours ---------------
}
