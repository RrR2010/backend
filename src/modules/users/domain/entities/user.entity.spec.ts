import { User } from '@modules/users/domain/entities/user.entity';
import { Email } from 'src/core/domain/value-objects/email.vo';
import { TenantId } from 'src/core/domain/value-objects/tentant-id.vo';
import { UserRole } from '@modules/users/domain/enums/user-role.enum';
import { UserStatus } from '@modules/users/domain/enums/user-status.enum';

describe('User Entity', () => {
  const tenantId = TenantId.from('tenant-1');
  const email = Email.from('user@test.com');

  function createUser() {
    return User.create({
      tenantId,
      email,
      name: 'Test User',
      passwordHash: '',
    });
  }

  it('should create user with default role MEMBER', () => {
    const user = createUser();
    expect(user.role).toBe(UserRole.MEMBER);
  });

  it('should create user with default status ACTIVE', () => {
    const user = createUser();
    expect(user.status).toBe(UserStatus.ACTIVE);
  });

  it('should promote to admin', () => {
    const user = createUser();
    user.promoteToAdmin();
    expect(user.role).toBe(UserRole.ADMIN);
  });

  it('should demote to member', () => {
    const user = createUser();
    user.promoteToAdmin();
    user.demoteToMember();
    expect(user.role).toBe(UserRole.MEMBER);
  });

  it('should deactivate user', () => {
    const user = createUser();
    user.deactivate();
    expect(user.status).toBe(UserStatus.INACTIVE);
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
