/**
 * User Entity Tests
 *
 * NOTE: This test file needs a complete rewrite to match the current entity.
 *
 * Current issues:
 * - Imports non-existent 'user-role.enum.ts' (should use 'platform-role.enum.ts')
 * - Imports non-existent 'user-status.enum.ts' (should use 'system-state.enum.ts')
 * - Tests methods that don't exist (promoteToAdmin, demoteToMember, deactivate)
 * - Uses tenantId which is not part of the User entity (User is platform-level)
 *
 * See TASK_005_008 for test rewrite.
 */
import { User } from '@modules/users/domain/user.entity';
import { Email } from '@core/domain/email.vo';
import { PlatformRole } from '@core/domain/platform-role.enum';
import { SystemState } from '@core/domain/system-state.enum';

describe('User Entity', () => {
  const email = Email.from('user@test.com');

  function createUser() {
    return User.create({
      email,
      name: 'Test User',
      passwordHash: '',
    });
  }

  it('should create user with default role MEMBER', () => {
    const user = createUser();
    expect(user.platformRole).toBe(PlatformRole.MEMBER);
  });

  it('should create user with default status ACTIVE', () => {
    const user = createUser();
    expect(user.systemState).toBe(SystemState.ACTIVE);
  });

  it('should have platform role property', () => {
    const user = createUser();
    expect(user.platformRole).toBe(PlatformRole.MEMBER);
  });

  it('should have systemState property', () => {
    const user = createUser();
    expect(user.systemState).toBe(SystemState.ACTIVE);
  });

  it('should change email', () => {
    const user = createUser();
    const newEmail = Email.from('newemail@test.com');
    user.changeEmail(newEmail);
    expect(user.email).toBe(newEmail);
  });

  it('should change name', () => {
    const user = createUser();
    user.changeName('New Name');
    expect(user.name).toBe('New Name');
  });
});
