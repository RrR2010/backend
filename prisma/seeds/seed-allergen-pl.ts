import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedAllergen = {
  name: string
  category: string | null
  regulatoryRef: string | null
  sortOrder: number
}

const allergens: SeedAllergen[] = [
  { name: 'Trigo', category: 'Cereais com glúten', regulatoryRef: null, sortOrder: 1 },
  { name: 'Centeio', category: 'Cereais com glúten', regulatoryRef: null, sortOrder: 2 },
  { name: 'Cevada', category: 'Cereais com glúten', regulatoryRef: null, sortOrder: 3 },
  { name: 'Aveia', category: 'Cereais com glúten', regulatoryRef: null, sortOrder: 4 },
  { name: 'Ovos', category: 'Ovos', regulatoryRef: null, sortOrder: 5 },
  { name: 'Amendoim', category: 'Amendoim', regulatoryRef: null, sortOrder: 6 },
  { name: 'Soja', category: 'Soja', regulatoryRef: null, sortOrder: 7 },
  { name: 'Leite', category: 'Laticínios', regulatoryRef: null, sortOrder: 8 },
  { name: 'Amêndoa', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 9 },
  { name: 'Avelã', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 10 },
  { name: 'Castanha-de-caju', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 11 },
  { name: 'Castanha-do-Pará', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 12 },
  { name: 'Macadâmia', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 13 },
  { name: 'Nozes', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 14 },
  { name: 'Pecã', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 15 },
  { name: 'Pistache', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 16 },
  { name: 'Pinhão', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 17 },
  { name: 'Crustáceos', category: 'Crustáceos', regulatoryRef: null, sortOrder: 18 },
  { name: 'Peixes', category: 'Peixes', regulatoryRef: null, sortOrder: 19 },
  { name: 'Látex natural', category: 'Látex', regulatoryRef: null, sortOrder: 20 },
  { name: 'Castanhas', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 21 },
]

async function main() {
  await prisma.allergen_PL.deleteMany()
  console.log('Cleared existing Allergen_PL records')

  for (const record of allergens) {
    await prisma.allergen_PL.create({ data: { id: crypto.randomUUID(), ...record } })
    console.log(`Created Allergen_PL: ${record.name}`)
  }

  console.log(`All ${allergens.length} Allergen_PL records seeded successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
