import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // Step 1: Check if the legacy "unit" column exists in FormulationItem_TE
  const columnExists = await prisma.$queryRawUnsafe<
    { column_name: string }[]
  >(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = 'FormulationItem'
       AND column_name = 'unit'`,
  )

  if (columnExists.length === 0) {
    console.log(
      'Legacy "unit" column not found in FormulationItem_TE — database is already migrated.',
    )
    console.log('No migration needed. Exiting.')
    return
  }

  console.log('Legacy "unit" column found. Proceeding with migration...')

  // Step 2: Build lookup map: code → actual UUID from DB
  const units = await prisma.unitOfMeasure_PL.findMany({
    select: { code: true, id: true },
  })
  const lookup = Object.fromEntries(units.map((u) => [u.code, u.id]))
  console.log(`Found ${units.length} UnitOfMeasure_PL records`)

  const mappings = [
    { oldUnit: 'g', code: 'G' },
    { oldUnit: 'ml', code: 'ML' },
    { oldUnit: 'un', code: 'UN' },
    { oldUnit: '%', code: 'PCT' },
  ]

  let totalMigrated = 0

  for (const { oldUnit, code } of mappings) {
    const unitId = lookup[code]
    if (!unitId) {
      console.warn(`UnitOfMeasure_PL not found for code: ${code}`)
      continue
    }

    const result = await prisma.$executeRawUnsafe(
      `UPDATE "FormulationItem" SET "unitId" = $1 WHERE "unit" = $2`,
      unitId,
      oldUnit,
    )

    if (result > 0) {
      console.log(
        `Migrated ${result} items: unit='${oldUnit}' → unitId='${unitId}' (code: ${code})`,
      )
    }
    totalMigrated += result
  }

  // Step 3: Check remaining unmigrated items (unitId still null)
  const remaining = await prisma.$queryRawUnsafe<
    { id: string; unit: string | null }[]
  >(
    `SELECT id, unit FROM "FormulationItem" WHERE "unitId" IS NULL`,
  )

  if (remaining.length > 0) {
    console.warn(`Warning: ${remaining.length} items still have no unitId`)
    const oldUnits = [...new Set(remaining.map((r) => r.unit))]
    console.warn(`Remaining old unit values: [${oldUnits.join(', ')}]`)
  } else {
    console.log('All FormulationItem_TE records have unitId populated.')
  }

  console.log(`\nMigration complete. Total items migrated: ${totalMigrated}`)
}

main()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
