import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserRepository } from '@users/user.repository'
import { IdentityRepository } from '@identities/identity.repository'
import { PasswordHasher } from '@authentication/password.hasher.service'
import { PlatformRole, UserScope } from '@users/user.types'
import { RequestContext } from '@authorization/authorization.types'
import { AuthProviderType } from '@authentication/authentication.types'
import { User } from '@users/user.entity'
import { Identity } from '@identities/identity.entity'
import { PlatformMembershipRepository } from '@platform-memberships/platform-membership.repository'
import { PlatformMembership } from '@platform-memberships/platform-membership.entity'
import { MemberProfileRepository } from '@member-profiles/member-profile.repository'
import { MemberProfile } from '@member-profiles/member-profile.entity'
import {
  BootstrapAlreadyExistsError,
  BootstrapInvalidKeyError
} from '@admin/admin.errors'

@Injectable()
export class AdminService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly identityRepository: IdentityRepository,
    private readonly membershipRepository: PlatformMembershipRepository,
    private readonly memberProfileRepository: MemberProfileRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async bootstrap(
    email: string,
    password: string,
    name: string
  ): Promise<{
    userId: string
    identityId: string
    membershipId: string
    memberProfileId: string
  }> {
    // Check if any user exists
    const platformCtx: RequestContext = {
      userId: 'system',
      scope: UserScope.PLATFORM,
      roles: [],
      impersonatedTenantId: null
    }
    const existingUsers = await this.userRepository.findAll({}, platformCtx)
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
    await this.userRepository.save(user, platformCtx)

    // Create PlatformMembership with ADMIN role
    const membership = PlatformMembership.create({
      userId: user.id.value,
      roles: [PlatformRole.ADMIN]
    })
    await this.membershipRepository.save(membership, platformCtx)

    // Create MemberProfile linked to the platform membership
    const memberProfile = MemberProfile.create({
      fullName: name,
      displayName: null,
      dateOfBirth: null,
      gender: null,
      photoUrl: null,
      externalId: null,
      locale: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      language: 'pt',
      platformMembershipId: membership.id.value,
      tenantMembershipId: null
    })
    await this.memberProfileRepository.save(memberProfile, platformCtx)

    // Hash password and create identity
    const secretHash = await this.passwordHasher.hash(password)
    const identity = Identity.create({
      userId: user.id.value,
      authProviderType: AuthProviderType.EMAIL,
      identifier: email,
      secretHash
    })
    await this.identityRepository.save(identity, platformCtx)

    return {
      userId: user.id.value,
      identityId: identity.id.value,
      membershipId: membership.id.value,
      memberProfileId: memberProfile.id.value
    }
  }
}
