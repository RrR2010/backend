import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedLabelField = {
  fieldName: string
  sortOrder: number
}

const labelFields: SeedLabelField[] = [
  // Paired fields (Designer + Gerencial)
  { fieldName: 'NomeComercial', sortOrder: 1 },
  { fieldName: 'DenominacaoVenda', sortOrder: 2 },
  { fieldName: 'Conteudo', sortOrder: 3 },
  { fieldName: 'Aroma', sortOrder: 4 },
  { fieldName: 'Corante', sortOrder: 5 },
  { fieldName: 'NovoPeso', sortOrder: 6 },
  { fieldName: 'NovaFormula', sortOrder: 7 },
  { fieldName: 'OGM', sortOrder: 8 },
  { fieldName: 'FOP', sortOrder: 9 },
  { fieldName: 'ListaIngredientes', sortOrder: 10 },
  { fieldName: 'Alergenicos', sortOrder: 11 },
  { fieldName: 'Lactose', sortOrder: 12 },
  { fieldName: 'Lactose2', sortOrder: 13 },
  { fieldName: 'Gluten', sortOrder: 14 },
  { fieldName: 'IdOrigem', sortOrder: 15 },
  { fieldName: 'PaisOrigem', sortOrder: 16 },
  { fieldName: 'Conservacao', sortOrder: 17 },
  { fieldName: 'Validade', sortOrder: 18 },
  { fieldName: 'Lote', sortOrder: 19 },
  { fieldName: 'Aspartame', sortOrder: 20 },
  { fieldName: 'Poliois', sortOrder: 21 },
  { fieldName: 'Irradiado', sortOrder: 22 },
  { fieldName: 'TabelaNutricional', sortOrder: 23 },
  { fieldName: 'CodigoBarras', sortOrder: 24 },
  { fieldName: 'Reciclagem', sortOrder: 25 },
  { fieldName: 'Selos', sortOrder: 26 },
  { fieldName: 'Comentarios', sortOrder: 27 },
  { fieldName: 'SAC', sortOrder: 28 },
  { fieldName: 'Alegacoes', sortOrder: 29 },
  // Single fields
  { fieldName: 'ListaIngredientesBruta', sortOrder: 30 },
  { fieldName: 'IngredientesTransgenicos', sortOrder: 31 },
  { fieldName: 'EspeciesDoadoras', sortOrder: 32 },
  { fieldName: 'InsumosINS', sortOrder: 33 },
  { fieldName: 'AlergPodeConter', sortOrder: 34 },
  { fieldName: 'AlegacoesRotulo', sortOrder: 35 },
  // ROT metadata
  { fieldName: 'Revisao', sortOrder: 36 },
  { fieldName: 'Versao', sortOrder: 37 },
  { fieldName: 'DataCriacao', sortOrder: 38 },
  { fieldName: 'DataRevisao', sortOrder: 39 },
  { fieldName: 'MotivoRevisao', sortOrder: 40 },
]

async function main() {
  await prisma.labelField_PL.deleteMany()
  console.log('Cleared existing LabelField_PL records')

  for (const record of labelFields) {
    await prisma.labelField_PL.create({ data: { id: crypto.randomUUID(), ...record } })
    console.log(`Created LabelField_PL: ${record.fieldName}`)
  }

  console.log(`All ${labelFields.length} LabelField_PL records seeded successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
