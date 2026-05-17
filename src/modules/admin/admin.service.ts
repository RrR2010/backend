import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserRepository } from '@users/user.repository'
import { IdentityRepository } from '@identities/identity.repository'
import { PasswordHasher } from '@authentication/password.hasher.service'
import { PlatformRole, UserScope } from '@users/user.types'
import { AuthProviderType } from '@authentication/authentication.types'
import { User } from '@users/user.entity'
import { Identity } from '@identities/identity.entity'
import { MembershipRepository } from '@memberships/membership.repository'
import { SystemState } from '@shared/enums'
import {
  BootstrapAlreadyExistsError,
  BootstrapInvalidKeyError
} from '@admin/admin.errors'
import { Id } from '@shared/value-objects'

@Injectable()
export class AdminService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly identityRepository: IdentityRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async bootstrap(
    email: string,
    password: string,
    name: string
  ): Promise<{ userId: string; identityId: string }> {
    // Check if any user exists
    const existingUsers = await this.userRepository.findAll()
    if (existingUsers.length > 0) {
      throw new BootstrapAlreadyExistsError()
    }

    // Validate bootstrap key from environment
    const bootstrapKey = this.configService.get<string>(
      'ADMIN_BOOTSTRAP_SECRET'
    )
    const providedKey = this.configService.get<string>('BOOTSTRAP_KEY')

    if (!bootstrapKey || !providedKey || bootstrapKey !== providedKey) {
      throw new BootstrapInvalidKeyError()
    }

    // Create user with PLATFORM scope
    const user = User.create({
      scope: UserScope.PLATFORM
    })
    await this.userRepository.save(user)

    // Create PlatformMembership with ADMIN role
    const now = new Date()
    await this.membershipRepository.savePlatformMembership({
      id: Id.generate().value,
      userId: user.id.value,
      roles: [PlatformRole.ADMIN],
      systemState: SystemState.ACTIVE,
      createdAt: now,
      updatedAt: now
    })

    // Hash password and create identity
    const secretHash = await this.passwordHasher.hash(password)
    const identity = Identity.create({
      userId: user.id.value,
      authProviderType: AuthProviderType.EMAIL,
      identifier: email,
      secretHash
    })
    await this.identityRepository.save(identity)

    return {
      userId: user.id.value,
      identityId: identity.id.value
    }
  }
}
