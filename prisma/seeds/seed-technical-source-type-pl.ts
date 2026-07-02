import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedTechnicalSourceType = {
  code: string
  name: string
  description: string | null
}

const technicalSourceTypes: SeedTechnicalSourceType[] = [
  { code: 'REGULATORY_TABLE', name: 'REGULATORY_TABLE', description: 'Tabela de composição regulatória' },
  { code: 'DATASHEET', name: 'DATASHEET', description: 'Ficha técnica do fornecedor' },
  { code: 'LAB_REPORT', name: 'LAB_REPORT', description: 'Laudo de análise laboratorial' },
  { code: 'INTERNET', name: 'INTERNET', description: 'Internet' },
  { code: 'CALCULATED', name: 'CALCULATED', description: 'Calculado (por formulação)' },
  { code: 'OTHER', name: 'OTHER', description: 'Outros' },
]

async function main() {
  await prisma.technicalSourceType_PL.deleteMany()
  console.log('Cleared existing TechnicalSourceType_PL records')

  for (const record of technicalSourceTypes) {
    await prisma.technicalSourceType_PL.create({ data: { id: crypto.randomUUID(), ...record } })
    console.log(`Created TechnicalSourceType_PL: ${record.code}`)
  }

  console.log(`All ${technicalSourceTypes.length} TechnicalSourceType_PL records seeded successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
