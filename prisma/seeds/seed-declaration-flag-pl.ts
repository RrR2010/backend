import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedDeclarationFlag = {
  id: string
  code: string
  name: string
  description: string | null
  appliesTo: 'INGREDIENT' | 'FORMULATION' | 'BOTH'
}

const declarationFlags: SeedDeclarationFlag[] = [
  { id: 'flag-01', code: 'IS_GMO', name: 'Is GMO', description: 'Contém organismos geneticamente modificados', appliesTo: 'BOTH' },
  { id: 'flag-02', code: 'IS_IRRADIATED', name: 'Is Irradiated', description: 'Foi submetido a irradiação', appliesTo: 'BOTH' },
  { id: 'flag-03', code: 'CONTAINS_LACTOSE', name: 'Contains Lactose', description: 'Contém lactose', appliesTo: 'BOTH' },
  { id: 'flag-04', code: 'CONTAINS_GLUTEN', name: 'Contains Gluten', description: 'Contém glúten', appliesTo: 'BOTH' },
  { id: 'flag-05', code: 'CONTAINS_ASPARTAME', name: 'Contains Aspartame', description: 'Contém aspartame (fenilalanina)', appliesTo: 'BOTH' },
  { id: 'flag-06', code: 'WARNING_POLIOIS', name: 'Warning Polyols', description: 'Advertência sobre quantidade de polióis (efeito laxativo)', appliesTo: 'FORMULATION' },
]

async function main() {
  await prisma.declarationFlag_PL.deleteMany()
  console.log('Cleared existing DeclarationFlag_PL records')

  for (const record of declarationFlags) {
    await prisma.declarationFlag_PL.create({ data: record })
    console.log(`Created DeclarationFlag_PL: ${record.code} (${record.id})`)
  }

  console.log(`All ${declarationFlags.length} DeclarationFlag_PL records seeded successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
