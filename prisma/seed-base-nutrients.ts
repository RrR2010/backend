import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedNutrient = {
  name: string
  unit: 'G' | 'MG' | 'MCG' | 'KCAL'
  category: 'MANDATORY_DECLARATION' | 'SPECIFIC_CARBS' | 'FATTY_ACIDS' | 'MINERALS' | 'FIBER' | 'VITAMINS' | 'OTHER'
  sortOrder: number
}

const nutrients: SeedNutrient[] = [
  // MANDATORY_DECLARATION
  { name: 'Valor energético', unit: 'KCAL', category: 'MANDATORY_DECLARATION', sortOrder: 1 },
  { name: 'Carboidratos', unit: 'G', category: 'MANDATORY_DECLARATION', sortOrder: 2 },
  { name: 'Açúcares totais', unit: 'G', category: 'MANDATORY_DECLARATION', sortOrder: 3 },
  { name: 'Açúcares adicionados (Fabricante)', unit: 'G', category: 'MANDATORY_DECLARATION', sortOrder: 4 },
  { name: 'Açúcares adicionados (Calculado)', unit: 'G', category: 'MANDATORY_DECLARATION', sortOrder: 5 },
  { name: 'Proteínas', unit: 'G', category: 'MANDATORY_DECLARATION', sortOrder: 6 },
  { name: 'Gorduras totais', unit: 'G', category: 'MANDATORY_DECLARATION', sortOrder: 7 },
  { name: 'Gorduras saturadas', unit: 'G', category: 'MANDATORY_DECLARATION', sortOrder: 8 },
  { name: 'Gorduras trans', unit: 'G', category: 'MANDATORY_DECLARATION', sortOrder: 9 },
  { name: 'Fibras alimentares', unit: 'G', category: 'MANDATORY_DECLARATION', sortOrder: 10 },
  { name: 'Sódio', unit: 'MG', category: 'MANDATORY_DECLARATION', sortOrder: 11 },

  // SPECIFIC_CARBS
  { name: 'Lactose', unit: 'G', category: 'SPECIFIC_CARBS', sortOrder: 1 },
  { name: 'Galactose', unit: 'G', category: 'SPECIFIC_CARBS', sortOrder: 2 },
  { name: 'Glicose', unit: 'G', category: 'SPECIFIC_CARBS', sortOrder: 3 },
  { name: 'Frutose', unit: 'G', category: 'SPECIFIC_CARBS', sortOrder: 4 },
  { name: 'Sacarose', unit: 'G', category: 'SPECIFIC_CARBS', sortOrder: 5 },
  { name: 'Maltose', unit: 'G', category: 'SPECIFIC_CARBS', sortOrder: 6 },
  { name: 'Amido', unit: 'G', category: 'SPECIFIC_CARBS', sortOrder: 7 },

  // FATTY_ACIDS
  { name: 'Colesterol', unit: 'MG', category: 'FATTY_ACIDS', sortOrder: 1 },
  { name: 'Gorduras monoinsaturadas', unit: 'G', category: 'FATTY_ACIDS', sortOrder: 2 },
  { name: 'Ômega 9', unit: 'G', category: 'FATTY_ACIDS', sortOrder: 3 },
  { name: 'Ácido oleico', unit: 'G', category: 'FATTY_ACIDS', sortOrder: 4 },
  { name: 'Gorduras poli-insaturadas', unit: 'G', category: 'FATTY_ACIDS', sortOrder: 5 },
  { name: 'Ômega 6', unit: 'G', category: 'FATTY_ACIDS', sortOrder: 6 },
  { name: 'Ácido linoleico', unit: 'G', category: 'FATTY_ACIDS', sortOrder: 7 },
  { name: 'Ácido araquidônico', unit: 'G', category: 'FATTY_ACIDS', sortOrder: 8 },
  { name: 'Ômega 3', unit: 'MG', category: 'FATTY_ACIDS', sortOrder: 9 },
  { name: 'Ácido linolênico', unit: 'MG', category: 'FATTY_ACIDS', sortOrder: 10 },
  { name: 'Ácido eicosapentaenoico', unit: 'MG', category: 'FATTY_ACIDS', sortOrder: 11 },
  { name: 'Ácido docosaexaenoico', unit: 'MG', category: 'FATTY_ACIDS', sortOrder: 12 },

  // MINERALS
  { name: 'Cálcio', unit: 'MG', category: 'MINERALS', sortOrder: 1 },
  { name: 'Cloreto', unit: 'MG', category: 'MINERALS', sortOrder: 2 },
  { name: 'Cobre', unit: 'MCG', category: 'MINERALS', sortOrder: 3 },
  { name: 'Cromo', unit: 'MCG', category: 'MINERALS', sortOrder: 4 },
  { name: 'Ferro', unit: 'MG', category: 'MINERALS', sortOrder: 5 },
  { name: 'Flúor', unit: 'MG', category: 'MINERALS', sortOrder: 6 },
  { name: 'Fósforo', unit: 'MG', category: 'MINERALS', sortOrder: 7 },
  { name: 'Iodo', unit: 'MCG', category: 'MINERALS', sortOrder: 8 },
  { name: 'Magnésio', unit: 'MG', category: 'MINERALS', sortOrder: 9 },
  { name: 'Manganês', unit: 'MG', category: 'MINERALS', sortOrder: 10 },
  { name: 'Molibdênio', unit: 'MCG', category: 'MINERALS', sortOrder: 11 },
  { name: 'Potássio', unit: 'MG', category: 'MINERALS', sortOrder: 12 },
  { name: 'Selênio', unit: 'MCG', category: 'MINERALS', sortOrder: 13 },
  { name: 'Zinco', unit: 'MG', category: 'MINERALS', sortOrder: 14 },

  // FIBER
  { name: 'Fibras solúveis', unit: 'G', category: 'FIBER', sortOrder: 1 },
  { name: 'Fibras insolúveis', unit: 'G', category: 'FIBER', sortOrder: 2 },
  { name: 'Polidextrose', unit: 'G', category: 'FIBER', sortOrder: 3 },
  { name: 'FOS', unit: 'G', category: 'FIBER', sortOrder: 4 },
  { name: 'GOS', unit: 'G', category: 'FIBER', sortOrder: 5 },
  { name: 'Inulina', unit: 'G', category: 'FIBER', sortOrder: 6 },
  { name: 'Isomaltooligossacarídeo', unit: 'G', category: 'FIBER', sortOrder: 7 },

  // VITAMINS
  { name: 'Vitamina A', unit: 'MCG', category: 'VITAMINS', sortOrder: 1 },
  { name: 'Vitamina D', unit: 'MCG', category: 'VITAMINS', sortOrder: 2 },
  { name: 'Vitamina E', unit: 'MG', category: 'VITAMINS', sortOrder: 3 },
  { name: 'Vitamina K', unit: 'MCG', category: 'VITAMINS', sortOrder: 4 },
  { name: 'Vitamina C', unit: 'MG', category: 'VITAMINS', sortOrder: 5 },
  { name: 'Vitamina B1', unit: 'MG', category: 'VITAMINS', sortOrder: 6 },
  { name: 'Vitamina B2', unit: 'MG', category: 'VITAMINS', sortOrder: 7 },
  { name: 'Vitamina B3', unit: 'MG', category: 'VITAMINS', sortOrder: 8 },
  { name: 'Vitamina B6', unit: 'MG', category: 'VITAMINS', sortOrder: 9 },
  { name: 'Vitamina B7', unit: 'MCG', category: 'VITAMINS', sortOrder: 10 },
  { name: 'Vitamina B9', unit: 'MCG', category: 'VITAMINS', sortOrder: 11 },
  { name: 'Vitamina B5', unit: 'MG', category: 'VITAMINS', sortOrder: 12 },
  { name: 'Vitamina B12', unit: 'MCG', category: 'VITAMINS', sortOrder: 13 },
]

async function main() {
  // Delete existing base nutrients first
  await prisma.baseNutrient.deleteMany()
  console.log('Cleared existing base nutrients')

  for (const nutrient of nutrients) {
    await prisma.baseNutrient.create({ data: nutrient })
    console.log(`Created base nutrient: ${nutrient.name}`)
  }

  console.log(`All ${nutrients.length} base nutrients seeded successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
