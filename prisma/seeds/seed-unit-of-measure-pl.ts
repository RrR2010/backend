import crypto from 'crypto'
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
  code: string
  symbol: string | null
  measurementType: 'MASS' | 'VOLUME' | 'LENGTH' | 'TIME' | 'TEMPERATURE' | 'UNITY' | 'RATIO' | 'ENERGY'
  measurementSystem: 'METRIC' | 'IMPERIAL' | 'US_CUSTOMARY'
}

const unitsOfMeasure: SeedUnitOfMeasure[] = [
  { code: 'G', symbol: 'g', measurementType: 'MASS', measurementSystem: 'METRIC' },
  { code: 'KG', symbol: 'kg', measurementType: 'MASS', measurementSystem: 'METRIC' },
  { code: 'MG', symbol: 'mg', measurementType: 'MASS', measurementSystem: 'METRIC' },
  { code: 'ML', symbol: 'mL', measurementType: 'VOLUME', measurementSystem: 'METRIC' },
  { code: 'L', symbol: 'L', measurementType: 'VOLUME', measurementSystem: 'METRIC' },
  { code: 'UN', symbol: 'un', measurementType: 'UNITY', measurementSystem: 'METRIC' },
  { code: 'PCT', symbol: '%', measurementType: 'RATIO', measurementSystem: 'METRIC' },
]

// ============== UnitConversion_PL ==============

type SeedUnitConversion = {
  fromUnitCode: string
  toUnitCode: string
  factor: number
}

const unitConversions: SeedUnitConversion[] = [
  // MASS
  { fromUnitCode: 'G', toUnitCode: 'KG', factor: 0.001 },       // G → KG
  { fromUnitCode: 'KG', toUnitCode: 'G', factor: 1000 },         // KG → G
  { fromUnitCode: 'MG', toUnitCode: 'G', factor: 0.001 },        // MG → G
  { fromUnitCode: 'G', toUnitCode: 'MG', factor: 1000 },         // G → MG
  { fromUnitCode: 'MG', toUnitCode: 'KG', factor: 0.000001 },    // MG → KG
  { fromUnitCode: 'KG', toUnitCode: 'MG', factor: 1000000 },     // KG → MG
  // VOLUME
  { fromUnitCode: 'ML', toUnitCode: 'L', factor: 0.001 },        // ML → L
  { fromUnitCode: 'L', toUnitCode: 'ML', factor: 1000 },         // L → ML
]

async function main() {
  // UnitConversion_PL must be deleted first (FK constraint)
  await prisma.unitConversion_PL.deleteMany()
  console.log('Cleared existing UnitConversion_PL records')

  // UnitOfMeasure_PL
  await prisma.unitOfMeasure_PL.deleteMany()
  console.log('Cleared existing UnitOfMeasure_PL records')

  // Build a map from unit code to generated UUID
  const unitIdByCode = new Map<string, string>()

  for (const record of unitsOfMeasure) {
    const created = await prisma.unitOfMeasure_PL.create({
      data: { id: crypto.randomUUID(), ...record },
    })
    unitIdByCode.set(record.code, created.id)
    console.log(`Created UnitOfMeasure_PL: ${record.code}`)
  }

  console.log(`All ${unitsOfMeasure.length} UnitOfMeasure_PL records seeded successfully`)

  // UnitConversion_PL
  for (const record of unitConversions) {
    await prisma.unitConversion_PL.create({
      data: {
        fromUnitId: unitIdByCode.get(record.fromUnitCode)!,
        toUnitId: unitIdByCode.get(record.toUnitCode)!,
        factor: record.factor,
      },
    })
    console.log(`Created UnitConversion_PL: ${record.fromUnitCode} → ${record.toUnitCode} = ${record.factor}`)
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
