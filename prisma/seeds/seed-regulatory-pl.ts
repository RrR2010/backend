import crypto from 'crypto'
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
  code: string
  name: string
  description: string | null
  abbreviation: string | null
}

const regulatoryBodies: SeedRegulatoryBody[] = [
  { code: 'ANVISA', name: 'Agência Nacional de Vigilância Sanitária', description: null, abbreviation: 'ANVISA' },
  { code: 'MAPA', name: 'Ministério da Agricultura e Pecuária', description: null, abbreviation: 'MAPA' },
]

// ============== RegulationType_PL ==============

type SeedRegulationType = {
  code: string
  name: string
  description: string | null
  abbreviation: string
}

const regulationTypes: SeedRegulationType[] = [
  { code: 'RDC', name: 'Resolução da Diretoria Colegiada', description: null, abbreviation: 'RDC' },
  { code: 'IN', name: 'Instrução Normativa', description: null, abbreviation: 'IN' },
  { code: 'DECRETO', name: 'Decreto', description: null, abbreviation: 'Decreto' },
  { code: 'LEI', name: 'Lei', description: null, abbreviation: 'Lei' },
  { code: 'PORTARIA', name: 'Portaria', description: null, abbreviation: 'Portaria' },
  { code: 'RESOLUCAO', name: 'Resolução', description: null, abbreviation: 'Resolução' },
]

async function main() {
  // RegulatoryBody_PL
  await prisma.regulatoryBody_PL.deleteMany()
  console.log('Cleared existing RegulatoryBody_PL records')

  for (const record of regulatoryBodies) {
    await prisma.regulatoryBody_PL.create({ data: { id: crypto.randomUUID(), ...record } })
    console.log(`Created RegulatoryBody_PL: ${record.abbreviation}`)
  }

  console.log(`All ${regulatoryBodies.length} RegulatoryBody_PL records seeded successfully`)

  // RegulationType_PL
  await prisma.regulationType_PL.deleteMany()
  console.log('Cleared existing RegulationType_PL records')

  for (const record of regulationTypes) {
    await prisma.regulationType_PL.create({ data: { id: crypto.randomUUID(), ...record } })
    console.log(`Created RegulationType_PL: ${record.abbreviation}`)
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
