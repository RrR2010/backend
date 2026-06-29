import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedProductCategory = {
  id: string
  code: string
  name: string
  description: string | null
  sequentialNumber: number
}

const productCategories: SeedProductCategory[] = [
  { id: 'cat-01', code: 'CAT-01', name: 'Açúcar, bala, bombom, chocolate, etc.', description: null, sequentialNumber: 1 },
  { id: 'cat-02', code: 'CAT-02', name: 'Aditivos alimentares, fermentos químicos', description: null, sequentialNumber: 2 },
  { id: 'cat-03', code: 'CAT-03', name: 'Alimentos para dietas com restrição', description: null, sequentialNumber: 3 },
  { id: 'cat-04', code: 'CAT-04', name: 'Amidos, biscoitos, cereais, farinhas, massas, pães', description: null, sequentialNumber: 4 },
  { id: 'cat-05', code: 'CAT-05', name: 'Café, chá, especiarias, temperos, molhos', description: null, sequentialNumber: 5 },
  { id: 'cat-06', code: 'CAT-06', name: 'Coadjuvantes de tecnologia, fermentos biológicos', description: null, sequentialNumber: 6 },
  { id: 'cat-07', code: 'CAT-07', name: 'Cogumelos, frutas, vegetais', description: null, sequentialNumber: 7 },
  { id: 'cat-08', code: 'CAT-08', name: 'Embalagens para alimentos', description: null, sequentialNumber: 8 },
  { id: 'cat-09', code: 'CAT-09', name: 'Gelados comestíveis e preparados para gelados comestíveis', description: null, sequentialNumber: 9 },
  { id: 'cat-10', code: 'CAT-10', name: 'Gelo, água mineral', description: null, sequentialNumber: 10 },
  { id: 'cat-11', code: 'CAT-11', name: 'Mistura para preparo de alimentos', description: null, sequentialNumber: 11 },
  { id: 'cat-12', code: 'CAT-12', name: 'Óleos e gorduras vegetais', description: null, sequentialNumber: 12 },
]

async function main() {
  await prisma.productCategory_PL.deleteMany()
  console.log('Cleared existing ProductCategory_PL records')

  for (const record of productCategories) {
    await prisma.productCategory_PL.create({ data: record })
    console.log(`Created ProductCategory_PL: ${record.name} (${record.id})`)
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
