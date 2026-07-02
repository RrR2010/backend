import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedPanelGeometricFormat = {
  formatName: string
  valueFields: any
  calculationFormula: string
}

const panelGeometricFormats: SeedPanelGeometricFormat[] = [
  {
    formatName: 'Retangular',
    valueFields: [
      { fieldName: 'width', label: 'Largura (cm)' },
      { fieldName: 'height', label: 'Altura (cm)' },
    ],
    calculationFormula: 'width * height',
  },
  {
    formatName: 'Quadrado',
    valueFields: [
      { fieldName: 'side', label: 'Lado (cm)' },
    ],
    calculationFormula: 'side * side',
  },
  {
    formatName: 'Cilíndrico',
    valueFields: [
      { fieldName: 'diameter', label: 'Diâmetro (cm)' },
      { fieldName: 'height', label: 'Altura (cm)' },
    ],
    calculationFormula: 'PI * diameter * height',
  },
  {
    formatName: 'Cônico',
    valueFields: [
      { fieldName: 'baseDiameter', label: 'Diâmetro base (cm)' },
      { fieldName: 'topDiameter', label: 'Diâmetro topo (cm)' },
      { fieldName: 'height', label: 'Altura (cm)' },
    ],
    calculationFormula: 'PI * ((baseDiameter + topDiameter) / 2) * height',
  },
]

async function main() {
  await prisma.panelGeometricFormatType_PL.deleteMany()
  console.log('Cleared existing PanelGeometricFormatType_PL records')

  for (const record of panelGeometricFormats) {
    await prisma.panelGeometricFormatType_PL.create({
      data: {
        id: crypto.randomUUID(),
        formatName: record.formatName,
        valueFields: record.valueFields,
        calculationFormula: record.calculationFormula,
      },
    })
    console.log(`Created PanelGeometricFormatType_PL: ${record.formatName}`)
  }

  console.log(`All ${panelGeometricFormats.length} PanelGeometricFormatType_PL records seeded successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
