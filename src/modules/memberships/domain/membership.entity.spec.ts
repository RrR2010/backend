/**
 * Membership Entity Tests
 *
 * Tests for Membership entity with tenantRoles array.
 * Implements TASK_005_014 unit tests.
 */
import { Membership } from '@modules/memberships/domain/membership.entity';
import { TenantRole } from '@core/domain/tenant-role.enum';
import { SystemState } from '@core/domain/system-state.enum';
import { Id } from '@core/domain/id.vo';

describe('Membership Entity', () => {
  function createMembership() {
    return Membership.create({
      userId: Id.generate().toString(),
      tenantId: Id.generate().toString(),
    });
  }

  it('should create membership with default role USER', () => {
    const membership = createMembership();
    expect(membership.tenantRoles).toContain(TenantRole.USER);
  });

  it('should create membership with default status ACTIVE', () => {
    const membership = createMembership();
    expect(membership.systemState).toBe(SystemState.ACTIVE);
  });

  it('should have tenantRoles array property', () => {
    const membership = createMembership();
    expect(membership.tenantRoles).toEqual([TenantRole.USER]);
  });

  it('should have userId and tenantId properties', () => {
    const userId = Id.generate().toString();
    const tenantId = Id.generate().toString();
    const membership = Membership.create({
      userId,
      tenantId,
    });
    expect(membership.userId).toBe(userId);
    expect(membership.tenantId).toBe(tenantId);
  });
});