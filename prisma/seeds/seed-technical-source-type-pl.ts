import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedTechnicalSourceType = {
  id: string
  code: string
  name: string
  description: string | null
}

const technicalSourceTypes: SeedTechnicalSourceType[] = [
  { id: 'tst-01', code: 'REGULATORY_TABLE', name: 'REGULATORY_TABLE', description: 'Tabela de composição regulatória' },
  { id: 'tst-02', code: 'DATASHEET', name: 'DATASHEET', description: 'Ficha técnica do fornecedor' },
  { id: 'tst-03', code: 'LAB_REPORT', name: 'LAB_REPORT', description: 'Laudo de análise laboratorial' },
  { id: 'tst-04', code: 'INTERNET', name: 'INTERNET', description: 'Internet' },
  { id: 'tst-05', code: 'CALCULATED', name: 'CALCULATED', description: 'Calculado (por formulação)' },
  { id: 'tst-06', code: 'OTHER', name: 'OTHER', description: 'Outros' },
]

async function main() {
  await prisma.technicalSourceType_PL.deleteMany()
  console.log('Cleared existing TechnicalSourceType_PL records')

  for (const record of technicalSourceTypes) {
    await prisma.technicalSourceType_PL.create({ data: record })
    console.log(`Created TechnicalSourceType_PL: ${record.code} (${record.id})`)
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
