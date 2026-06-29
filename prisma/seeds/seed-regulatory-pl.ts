import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

// ============== RegulatoryBody_PL ==============

type SeedRegulatoryBody = {
  id: string
  code: string
  name: string
  description: string | null
  abbreviation: string | null
}

const regulatoryBodies: SeedRegulatoryBody[] = [
  { id: 'rb-01', code: 'ANVISA', name: 'Agência Nacional de Vigilância Sanitária', description: null, abbreviation: 'ANVISA' },
  { id: 'rb-02', code: 'MAPA', name: 'Ministério da Agricultura e Pecuária', description: null, abbreviation: 'MAPA' },
]

// ============== RegulationType_PL ==============

type SeedRegulationType = {
  id: string
  code: string
  name: string
  description: string | null
  abbreviation: string
}

const regulationTypes: SeedRegulationType[] = [
  { id: 'rt-01', code: 'RDC', name: 'Resolução da Diretoria Colegiada', description: null, abbreviation: 'RDC' },
  { id: 'rt-02', code: 'IN', name: 'Instrução Normativa', description: null, abbreviation: 'IN' },
  { id: 'rt-03', code: 'DECRETO', name: 'Decreto', description: null, abbreviation: 'Decreto' },
  { id: 'rt-04', code: 'LEI', name: 'Lei', description: null, abbreviation: 'Lei' },
  { id: 'rt-05', code: 'PORTARIA', name: 'Portaria', description: null, abbreviation: 'Portaria' },
  { id: 'rt-06', code: 'RESOLUCAO', name: 'Resolução', description: null, abbreviation: 'Resolução' },
]

async function main() {
  // RegulatoryBody_PL
  await prisma.regulatoryBody_PL.deleteMany()
  console.log('Cleared existing RegulatoryBody_PL records')

  for (const record of regulatoryBodies) {
    await prisma.regulatoryBody_PL.create({ data: record })
    console.log(`Created RegulatoryBody_PL: ${record.abbreviation} (${record.id})`)
  }

  console.log(`All ${regulatoryBodies.length} RegulatoryBody_PL records seeded successfully`)

  // RegulationType_PL
  await prisma.regulationType_PL.deleteMany()
  console.log('Cleared existing RegulationType_PL records')

  for (const record of regulationTypes) {
    await prisma.regulationType_PL.create({ data: record })
    console.log(`Created RegulationType_PL: ${record.abbreviation} (${record.id})`)
  }

  console.log(`All ${regulationTypes.length} RegulationType_PL records seeded successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
