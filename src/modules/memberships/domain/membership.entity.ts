import { Entity, EntityProps, CreateEntityProps } from '@core/domain/entity';
import { SystemState } from '@core/domain/system-state.enum';
import { TenantRole } from '@core/domain/authorization';
import { Id } from '@core/domain/id.vo';

/**
 * Membership Entity
 *
 * Represents a user's association with a tenant.
 * Contains tenant-level roles (TenantRole) that define permissions within the tenant.
 *
 * Canonical Vocabulary:
 * - tenantRoles: TenantRole[] (ADMIN, USER) - per-tenant scope
 * - scope: tenant (vs platform for PlatformRole)
 */

type MembershipProps = EntityProps & {
  userId: string;
  tenantId: string;
  tenantRoles: TenantRole[];
};

type CreateMembershipProps = CreateEntityProps<MembershipProps> & {
  tenantRoles?: TenantRole[];
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
      tenantRoles: props.tenantRoles || [TenantRole.USER],
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

  get tenantRoles(): TenantRole[] {
    return this._props.tenantRoles;
  }

  // --------------- Behaviours ---------------
}
