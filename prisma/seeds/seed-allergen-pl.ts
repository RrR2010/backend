import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedAllergen = {
  id: string
  name: string
  category: string | null
  regulatoryRef: string | null
  sortOrder: number
}

const allergens: SeedAllergen[] = [
  { id: 'aller-01', name: 'Trigo', category: 'Cereais com glúten', regulatoryRef: null, sortOrder: 1 },
  { id: 'aller-02', name: 'Centeio', category: 'Cereais com glúten', regulatoryRef: null, sortOrder: 2 },
  { id: 'aller-03', name: 'Cevada', category: 'Cereais com glúten', regulatoryRef: null, sortOrder: 3 },
  { id: 'aller-04', name: 'Aveia', category: 'Cereais com glúten', regulatoryRef: null, sortOrder: 4 },
  { id: 'aller-05', name: 'Ovos', category: 'Ovos', regulatoryRef: null, sortOrder: 5 },
  { id: 'aller-06', name: 'Amendoim', category: 'Amendoim', regulatoryRef: null, sortOrder: 6 },
  { id: 'aller-07', name: 'Soja', category: 'Soja', regulatoryRef: null, sortOrder: 7 },
  { id: 'aller-08', name: 'Leite', category: 'Laticínios', regulatoryRef: null, sortOrder: 8 },
  { id: 'aller-09', name: 'Amêndoa', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 9 },
  { id: 'aller-10', name: 'Avelã', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 10 },
  { id: 'aller-11', name: 'Castanha-de-caju', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 11 },
  { id: 'aller-12', name: 'Castanha-do-Pará', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 12 },
  { id: 'aller-13', name: 'Macadâmia', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 13 },
  { id: 'aller-14', name: 'Nozes', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 14 },
  { id: 'aller-15', name: 'Pecã', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 15 },
  { id: 'aller-16', name: 'Pistache', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 16 },
  { id: 'aller-17', name: 'Pinhão', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 17 },
  { id: 'aller-18', name: 'Crustáceos', category: 'Crustáceos', regulatoryRef: null, sortOrder: 18 },
  { id: 'aller-19', name: 'Peixes', category: 'Peixes', regulatoryRef: null, sortOrder: 19 },
  { id: 'aller-20', name: 'Látex natural', category: 'Látex', regulatoryRef: null, sortOrder: 20 },
  { id: 'aller-21', name: 'Castanhas', category: 'Oleaginosas', regulatoryRef: null, sortOrder: 21 },
]

async function main() {
  await prisma.allergen_PL.deleteMany()
  console.log('Cleared existing Allergen_PL records')

  for (const record of allergens) {
    await prisma.allergen_PL.create({ data: record })
    console.log(`Created Allergen_PL: ${record.name} (${record.id})`)
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
