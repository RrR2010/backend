import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedProductCategory = {
  code: string
  name: string
  description: string | null
  sequentialNumber: number
}

const productCategories: SeedProductCategory[] = [
  { code: 'CAT-01', name: 'Açúcar, bala, bombom, chocolate, etc.', description: null, sequentialNumber: 1 },
  { code: 'CAT-02', name: 'Aditivos alimentares, fermentos químicos', description: null, sequentialNumber: 2 },
  { code: 'CAT-03', name: 'Alimentos para dietas com restrição', description: null, sequentialNumber: 3 },
  { code: 'CAT-04', name: 'Amidos, biscoitos, cereais, farinhas, massas, pães', description: null, sequentialNumber: 4 },
  { code: 'CAT-05', name: 'Café, chá, especiarias, temperos, molhos', description: null, sequentialNumber: 5 },
  { code: 'CAT-06', name: 'Coadjuvantes de tecnologia, fermentos biológicos', description: null, sequentialNumber: 6 },
  { code: 'CAT-07', name: 'Cogumelos, frutas, vegetais', description: null, sequentialNumber: 7 },
  { code: 'CAT-08', name: 'Embalagens para alimentos', description: null, sequentialNumber: 8 },
  { code: 'CAT-09', name: 'Gelados comestíveis e preparados para gelados comestíveis', description: null, sequentialNumber: 9 },
  { code: 'CAT-10', name: 'Gelo, água mineral', description: null, sequentialNumber: 10 },
  { code: 'CAT-11', name: 'Mistura para preparo de alimentos', description: null, sequentialNumber: 11 },
  { code: 'CAT-12', name: 'Óleos e gorduras vegetais', description: null, sequentialNumber: 12 },
]

async function main() {
  await prisma.productCategory_PL.deleteMany()
  console.log('Cleared existing ProductCategory_PL records')

  for (const record of productCategories) {
    await prisma.productCategory_PL.create({ data: { id: crypto.randomUUID(), ...record } })
    console.log(`Created ProductCategory_PL: ${record.name}`)
  }

  console.log(`All ${productCategories.length} ProductCategory_PL records seeded successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
