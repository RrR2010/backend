import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedLabelField = {
  id: string
  fieldName: string
  sortOrder: number
}

const labelFields: SeedLabelField[] = [
  // Paired fields (Designer + Gerencial)
  { id: 'lbl-01', fieldName: 'NomeComercial', sortOrder: 1 },
  { id: 'lbl-02', fieldName: 'DenominacaoVenda', sortOrder: 2 },
  { id: 'lbl-03', fieldName: 'Conteudo', sortOrder: 3 },
  { id: 'lbl-04', fieldName: 'Aroma', sortOrder: 4 },
  { id: 'lbl-05', fieldName: 'Corante', sortOrder: 5 },
  { id: 'lbl-06', fieldName: 'NovoPeso', sortOrder: 6 },
  { id: 'lbl-07', fieldName: 'NovaFormula', sortOrder: 7 },
  { id: 'lbl-08', fieldName: 'OGM', sortOrder: 8 },
  { id: 'lbl-09', fieldName: 'FOP', sortOrder: 9 },
  { id: 'lbl-10', fieldName: 'ListaIngredientes', sortOrder: 10 },
  { id: 'lbl-11', fieldName: 'Alergenicos', sortOrder: 11 },
  { id: 'lbl-12', fieldName: 'Lactose', sortOrder: 12 },
  { id: 'lbl-13', fieldName: 'Lactose2', sortOrder: 13 },
  { id: 'lbl-14', fieldName: 'Gluten', sortOrder: 14 },
  { id: 'lbl-15', fieldName: 'IdOrigem', sortOrder: 15 },
  { id: 'lbl-16', fieldName: 'PaisOrigem', sortOrder: 16 },
  { id: 'lbl-17', fieldName: 'Conservacao', sortOrder: 17 },
  { id: 'lbl-18', fieldName: 'Validade', sortOrder: 18 },
  { id: 'lbl-19', fieldName: 'Lote', sortOrder: 19 },
  { id: 'lbl-20', fieldName: 'Aspartame', sortOrder: 20 },
  { id: 'lbl-21', fieldName: 'Poliois', sortOrder: 21 },
  { id: 'lbl-22', fieldName: 'Irradiado', sortOrder: 22 },
  { id: 'lbl-23', fieldName: 'TabelaNutricional', sortOrder: 23 },
  { id: 'lbl-24', fieldName: 'CodigoBarras', sortOrder: 24 },
  { id: 'lbl-25', fieldName: 'Reciclagem', sortOrder: 25 },
  { id: 'lbl-26', fieldName: 'Selos', sortOrder: 26 },
  { id: 'lbl-27', fieldName: 'Comentarios', sortOrder: 27 },
  { id: 'lbl-28', fieldName: 'SAC', sortOrder: 28 },
  { id: 'lbl-29', fieldName: 'Alegacoes', sortOrder: 29 },
  // Single fields
  { id: 'lbl-30', fieldName: 'ListaIngredientesBruta', sortOrder: 30 },
  { id: 'lbl-31', fieldName: 'IngredientesTransgenicos', sortOrder: 31 },
  { id: 'lbl-32', fieldName: 'EspeciesDoadoras', sortOrder: 32 },
  { id: 'lbl-33', fieldName: 'InsumosINS', sortOrder: 33 },
  { id: 'lbl-34', fieldName: 'AlergPodeConter', sortOrder: 34 },
  { id: 'lbl-35', fieldName: 'AlegacoesRotulo', sortOrder: 35 },
  // ROT metadata
  { id: 'lbl-36', fieldName: 'Revisao', sortOrder: 36 },
  { id: 'lbl-37', fieldName: 'Versao', sortOrder: 37 },
  { id: 'lbl-38', fieldName: 'DataCriacao', sortOrder: 38 },
  { id: 'lbl-39', fieldName: 'DataRevisao', sortOrder: 39 },
  { id: 'lbl-40', fieldName: 'MotivoRevisao', sortOrder: 40 },
]

async function main() {
  await prisma.labelField_PL.deleteMany()
  console.log('Cleared existing LabelField_PL records')

  for (const record of labelFields) {
    await prisma.labelField_PL.create({ data: record })
    console.log(`Created LabelField_PL: ${record.fieldName} (${record.id})`)
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
