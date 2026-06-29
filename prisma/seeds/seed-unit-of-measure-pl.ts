import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

// ============== UnitOfMeasure_PL ==============

type SeedUnitOfMeasure = {
  id: string
  code: string
  symbol: string | null
  measurementType: 'MASS' | 'VOLUME' | 'LENGTH' | 'TIME' | 'TEMPERATURE' | 'UNITY' | 'RATIO' | 'ENERGY'
  measurementSystem: 'METRIC' | 'IMPERIAL' | 'US_CUSTOMARY'
}

const unitsOfMeasure: SeedUnitOfMeasure[] = [
  { id: 'uom-01', code: 'G', symbol: 'g', measurementType: 'MASS', measurementSystem: 'METRIC' },
  { id: 'uom-02', code: 'KG', symbol: 'kg', measurementType: 'MASS', measurementSystem: 'METRIC' },
  { id: 'uom-03', code: 'MG', symbol: 'mg', measurementType: 'MASS', measurementSystem: 'METRIC' },
  { id: 'uom-04', code: 'ML', symbol: 'mL', measurementType: 'VOLUME', measurementSystem: 'METRIC' },
  { id: 'uom-05', code: 'L', symbol: 'L', measurementType: 'VOLUME', measurementSystem: 'METRIC' },
  { id: 'uom-06', code: 'UN', symbol: 'un', measurementType: 'UNITY', measurementSystem: 'METRIC' },
  { id: 'uom-07', code: 'PCT', symbol: '%', measurementType: 'RATIO', measurementSystem: 'METRIC' },
]

// ============== UnitConversion_PL ==============

type SeedUnitConversion = {
  id: string
  fromUnitId: string
  toUnitId: string
  factor: number
}

const unitConversions: SeedUnitConversion[] = [
  // MASS
  { id: 'conv-01', fromUnitId: 'uom-01', toUnitId: 'uom-02', factor: 0.001 },       // G → KG
  { id: 'conv-02', fromUnitId: 'uom-02', toUnitId: 'uom-01', factor: 1000 },         // KG → G
  { id: 'conv-03', fromUnitId: 'uom-03', toUnitId: 'uom-01', factor: 0.001 },        // MG → G
  { id: 'conv-04', fromUnitId: 'uom-01', toUnitId: 'uom-03', factor: 1000 },         // G → MG
  { id: 'conv-05', fromUnitId: 'uom-03', toUnitId: 'uom-02', factor: 0.000001 },     // MG → KG
  { id: 'conv-06', fromUnitId: 'uom-02', toUnitId: 'uom-03', factor: 1000000 },      // KG → MG
  // VOLUME
  { id: 'conv-07', fromUnitId: 'uom-04', toUnitId: 'uom-05', factor: 0.001 },        // ML → L
  { id: 'conv-08', fromUnitId: 'uom-05', toUnitId: 'uom-04', factor: 1000 },         // L → ML
]

async function main() {
  // UnitConversion_PL must be deleted first (FK constraint)
  await prisma.unitConversion_PL.deleteMany()
  console.log('Cleared existing UnitConversion_PL records')

  // UnitOfMeasure_PL
  await prisma.unitOfMeasure_PL.deleteMany()
  console.log('Cleared existing UnitOfMeasure_PL records')

  for (const record of unitsOfMeasure) {
    await prisma.unitOfMeasure_PL.create({ data: record })
    console.log(`Created UnitOfMeasure_PL: ${record.code} (${record.id})`)
  }

  console.log(`All ${unitsOfMeasure.length} UnitOfMeasure_PL records seeded successfully`)

  // UnitConversion_PL
  for (const record of unitConversions) {
    await prisma.unitConversion_PL.create({ data: record })
    console.log(`Created UnitConversion_PL: ${record.id} (${record.fromUnitId} → ${record.toUnitId} = ${record.factor})`)
  }

  console.log(`All ${unitConversions.length} UnitConversion_PL records seeded successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
