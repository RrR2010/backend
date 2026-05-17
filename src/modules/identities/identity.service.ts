import { Injectable } from '@nestjs/common'
import { CreateIdentityDto } from '@identities/identity.dto'
import {
  IdentityRepository,
  IdentityFilter
} from '@identities/identity.repository'
import { RequestContext } from '@authorization/authorization.types'
import { Identity } from '@identities/identity.entity'
import { PasswordHasher } from '@authentication/password.hasher.service'

@Injectable()
export class IdentityService {
  constructor(
    private readonly identityRepository: IdentityRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async create(
    dto: CreateIdentityDto,
    context: RequestContext
  ): Promise<Identity> {
    const secretHash = dto.secret
      ? await this.passwordHasher.hash(dto.secret)
      : null
    const identity = Identity.create({
      userId: dto.userId,
      authProviderType: dto.provider,
      identifier: dto.identifier,
      secretHash: secretHash
    })

    await this.identityRepository.save(identity)
    return identity
  }

  async findAll(
    filter?: IdentityFilter,
    context?: RequestContext
  ): Promise<Identity[]> {
    return this.identityRepository.findAll(filter)
  }

  async findById(
    id: string,
    context: RequestContext
  ): Promise<Identity | null> {
    return this.identityRepository.findById(id)
  }

  async save(identity: Identity, context: RequestContext): Promise<Identity> {
    return this.identityRepository.save(identity)
  }

  async delete(id: string, context: RequestContext): Promise<void> {
    await this.identityRepository.delete(id)
  }
}
