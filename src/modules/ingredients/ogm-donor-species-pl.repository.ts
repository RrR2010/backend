import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { OgmDonorSpecies_PL } from '@ingredients/ogm-donor-species-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  OgmDonorSpecies_PL as PrismaOgmDonorSpeciesPL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: OgmDonorSpecies_PL é entidade platform-scoped (sem tenantId).
// Permanece acessível globalmente por usuários PLATFORM durante impersonação.

export type OgmDonorSpecies_PLFilter = {
  category?: string
  systemState?: SystemState
}

export abstract class OgmDonorSpecies_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL | null>
  abstract findAll(
    filter: OgmDonorSpecies_PLFilter,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL[]>
  abstract save(
    species: OgmDonorSpecies_PL,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaOgmDonorSpecies_PLRepository
  implements OgmDonorSpecies_PLRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaOgmDonorSpeciesPL =
      await this.prisma.ogmDonorSpecies_PL.findUnique({
        where: { id }
      })
    if (!prismaOgmDonorSpeciesPL) return null
    if (prismaOgmDonorSpeciesPL.systemState === 'DELETED') {
      return null
    }
    return PrismaOgmDonorSpecies_PLMapper.toDomain(prismaOgmDonorSpeciesPL)
  }

  async findAll(
    filter: OgmDonorSpecies_PLFilter,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.OgmDonorSpecies_PLWhereInput = {}
    if (filter.category) {
      where.category = { contains: filter.category, mode: 'insensitive' }
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaSpeciesPL =
      await this.prisma.ogmDonorSpecies_PL.findMany({
        where,
        orderBy: { scientificName: 'asc' }
      })
    return prismaSpeciesPL.map((species) =>
      PrismaOgmDonorSpecies_PLMapper.toDomain(species)
    )
  }

  async save(
    species: OgmDonorSpecies_PL,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL> {
    // Platform-scoped resource — no tenantId
    const id = species.id.value
    const data = PrismaOgmDonorSpecies_PLMapper.toPersistence(species)
    await this.prisma.ogmDonorSpecies_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return species
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.ogmDonorSpecies_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaOgmDonorSpecies_PLMapper {
  static toDomain(
    prismaOgmDonorSpeciesPL: PrismaOgmDonorSpeciesPL
  ): OgmDonorSpecies_PL {
    return OgmDonorSpecies_PL.rehydrate({
      id: Id.from(prismaOgmDonorSpeciesPL.id),
      createdAt: prismaOgmDonorSpeciesPL.createdAt,
      updatedAt: prismaOgmDonorSpeciesPL.updatedAt,
      systemState:
        SystemState[
          prismaOgmDonorSpeciesPL.systemState as keyof typeof SystemState
        ],
      scientificName: prismaOgmDonorSpeciesPL.scientificName,
      commonName: prismaOgmDonorSpeciesPL.commonName,
      category: prismaOgmDonorSpeciesPL.category,
      createdBy: prismaOgmDonorSpeciesPL.createdBy,
      updatedBy: prismaOgmDonorSpeciesPL.updatedBy
    })
  }

  static toPersistence(
    species: OgmDonorSpecies_PL
  ): Prisma.OgmDonorSpecies_PLCreateInput {
    return {
      id: species.id.value,
      createdAt: species.createdAt,
      updatedAt: species.updatedAt,
      systemState: species.systemState,
      scientificName: species.scientificName,
      commonName: species.commonName,
      category: species.category,
      createdBy: species.createdBy,
      updatedBy: species.updatedBy
    }
  }
}
