import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import type { ImpersonationTenantsResponseDto } from './impersonation.dto'

@Injectable()
export class ImpersonationService {
  constructor(private readonly prisma: PrismaService) {}

  async getImpersonatableTenants(): Promise<ImpersonationTenantsResponseDto> {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        systemState: 'ACTIVE',
        subscription: {
          status: { in: ['ACTIVE', 'GRACE'] }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        subscription: {
          select: { status: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return {
      tenants: tenants.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        subscriptionStatus: t.subscription?.status ?? null
      }))
    }
  }
}
