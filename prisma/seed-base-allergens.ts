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
  // CEREAIS — Gluten-containing grains
  {
    name: 'Glúten',
    category: 'CEREAIS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 1
  },
  {
    name: 'Trigo',
    category: 'CEREAIS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 2
  },
  {
    name: 'Cevada',
    category: 'CEREAIS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 3
  },
  {
    name: 'Centeio',
    category: 'CEREAIS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 4
  },
  {
    name: 'Aveia',
    category: 'CEREAIS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 5
  },
  {
    name: 'Espelta',
    category: 'CEREAIS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 6
  },

  // CRUSTACEOS
  {
    name: 'Crustáceos',
    category: 'CRUSTACEOS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 7
  },

  // OVOS
  {
    name: 'Ovos',
    category: 'OVOS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 8
  },

  // PEIXES
  {
    name: 'Peixes',
    category: 'PEIXES',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 9
  },

  // AMENDOIM
  {
    name: 'Amendoim',
    category: 'AMENDOIM',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 10
  },

  // SOJA
  {
    name: 'Soja',
    category: 'SOJA',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 11
  },

  // LACTEOS
  {
    name: 'Leite',
    category: 'LACTEOS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 12
  },

  // OLEAGINOSAS — Tree nuts
  {
    name: 'Amêndoas',
    category: 'OLEAGINOSAS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 13
  },
  {
    name: 'Castanha-de-caju',
    category: 'OLEAGINOSAS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 14
  },
  {
    name: 'Castanha-do-pará',
    category: 'OLEAGINOSAS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 15
  },
  {
    name: 'Nozes',
    category: 'OLEAGINOSAS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 16
  },
  {
    name: 'Avelãs',
    category: 'OLEAGINOSAS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 17
  },

  // SEMENTES
  {
    name: 'Sementes de gergelim',
    category: 'SEMENTES',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 18
  },
  {
    name: 'Sementes de mostarda',
    category: 'SEMENTES',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 19
  },

  // SULFITOS
  {
    name: 'Sulfitos (>10mg/kg)',
    category: 'SULFITOS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 20
  },

  // LEGUMINOSAS
  {
    name: 'Lupino',
    category: 'LEGUMINOSAS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 21
  },

  // MOLUSCOS
  {
    name: 'Moluscos',
    category: 'MOLUSCOS',
    regulatoryRef: 'RDC 26/2015',
    sortOrder: 22
  }
]

async function main() {
  // Delete existing base allergens first
  await prisma.allergen_PL.deleteMany()
  console.log('Cleared existing base allergens')

  for (const allergen of allergens) {
    await prisma.allergen_PL.create({ data: allergen })
    console.log(`Created base allergen: ${allergen.name}`)
  }

  console.log(`All ${allergens.length} base allergens seeded successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
