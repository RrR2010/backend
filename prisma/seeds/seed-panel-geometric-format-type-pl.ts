import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedPanelGeometricFormat = {
  id: string
  formatName: string
  valueFields: any
  calculationFormula: string
}

const panelGeometricFormats: SeedPanelGeometricFormat[] = [
  {
    id: 'pgf-01',
    formatName: 'Retangular',
    valueFields: [
      { fieldName: 'width', label: 'Largura (cm)' },
      { fieldName: 'height', label: 'Altura (cm)' },
    ],
    calculationFormula: 'width * height',
  },
  {
    id: 'pgf-02',
    formatName: 'Quadrado',
    valueFields: [
      { fieldName: 'side', label: 'Lado (cm)' },
    ],
    calculationFormula: 'side * side',
  },
  {
    id: 'pgf-03',
    formatName: 'Cilíndrico',
    valueFields: [
      { fieldName: 'diameter', label: 'Diâmetro (cm)' },
      { fieldName: 'height', label: 'Altura (cm)' },
    ],
    calculationFormula: 'PI * diameter * height',
  },
  {
    id: 'pgf-04',
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
        id: record.id,
        formatName: record.formatName,
        valueFields: record.valueFields,
        calculationFormula: record.calculationFormula,
      },
    })
    console.log(`Created PanelGeometricFormatType_PL: ${record.formatName} (${record.id})`)
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
