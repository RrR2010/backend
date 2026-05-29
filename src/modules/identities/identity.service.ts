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

  async create(dto: CreateIdentityDto, ctx: RequestContext): Promise<Identity> {
    const secretHash = dto.secret
      ? await this.passwordHasher.hash(dto.secret)
      : null
    const identity = Identity.create({
      userId: dto.userId,
      authProviderType: dto.provider,
      identifier: dto.identifier,
      secretHash: secretHash
    })

    await this.identityRepository.save(identity, ctx)
    return identity
  }

  async findAll(
    filter: IdentityFilter,
    ctx: RequestContext
  ): Promise<Identity[]> {
    return this.identityRepository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Identity | null> {
    return this.identityRepository.findById(id, ctx)
  }

  async save(identity: Identity, ctx: RequestContext): Promise<Identity> {
    return this.identityRepository.save(identity, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    await this.identityRepository.delete(id, ctx)
  }
}
