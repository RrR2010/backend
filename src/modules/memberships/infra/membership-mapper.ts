import { Membership as PrismaMembership } from '@prisma/client';
import { Membership } from '@modules/memberships/domain/membership.entity';
import { TenantRole } from '@core/domain/tenant-role.enum';
import { Id } from '@core/domain/id.vo';
import { SystemState } from '@core/domain/system-state.enum';

export class PrismaMembershipMapper {
  static toDomain(prismaMembership: PrismaMembership): Membership {
    const tenantRoles =
      (prismaMembership.tenantRoles as unknown as TenantRole[]) || [
        TenantRole.USER,
      ];

    return Membership.rehydratate({
      id: Id.from(prismaMembership.id),
      createdAt: prismaMembership.createdAt,
      updatedAt: prismaMembership.updatedAt,
      systemState:
        SystemState[prismaMembership.systemState as keyof typeof SystemState],
      userId: prismaMembership.userId,
      tenantId: prismaMembership.tenantId,
      tenantRoles,
    });
  }

  static toPersistence(membership: Membership) {
    return {
      id: membership.id.value,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
      systemState: membership.systemState,
      userId: membership.userId,
      tenantId: membership.tenantId,
      roles: membership.tenantRoles,
    };
  }
}
