/**
 * User Entity Tests
 *
 * Tests for User entity with platformRoles array.
 * Implements TASK_005_014 unit tests.
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
    expect(user.platformRoles).toContain(PlatformRole.MEMBER);
  });

  it('should create user with default status ACTIVE', () => {
    const user = createUser();
    expect(user.systemState).toBe(SystemState.ACTIVE);
  });

  it('should have platformRoles array property', () => {
    const user = createUser();
    expect(user.platformRoles).toEqual([PlatformRole.MEMBER]);
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
