import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { ClsContextService } from '@shared/cls/cls-context.service'
import { createTenantFilterExtension } from './tenant-filter.extension'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public readonly extended: PrismaClient

  constructor(private readonly clsContextService: ClsContextService) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!
    })
    super({ adapter })

    this.extended = createTenantFilterExtension(clsContextService)(
      this
    ) as unknown as PrismaClient
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
