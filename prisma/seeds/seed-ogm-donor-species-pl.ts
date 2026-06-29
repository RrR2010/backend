import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedOgmDonorSpecies = {
  id: string
  scientificName: string
  commonName: string | null
  category: string | null
}

const ogmDonorSpecies: SeedOgmDonorSpecies[] = [
  { id: 'ogm-01', scientificName: 'Bacillus thuringiensis', category: 'Bacteria', commonName: null },
  { id: 'ogm-02', scientificName: 'Streptomyces viridochromogenes', category: 'Bacteria', commonName: null },
  { id: 'ogm-03', scientificName: 'Agrobacterium tumefaciens', category: 'Bacteria', commonName: null },
  { id: 'ogm-04', scientificName: 'Zea mays (milho)', category: 'Plant', commonName: null },
  { id: 'ogm-05', scientificName: 'Sphingobium herbicidovorans', category: 'Bacteria', commonName: null },
  { id: 'ogm-06', scientificName: 'Stenotrophomonas maltophilia', category: 'Bacteria', commonName: null },
  { id: 'ogm-07', scientificName: 'Diabrotica virgifera (besouro)', category: 'Insect', commonName: null },
  { id: 'ogm-08', scientificName: 'Escherichia coli', category: 'Bacteria', commonName: null },
  { id: 'ogm-09', scientificName: 'Dictyostelium discoideum', category: 'Amoeba', commonName: null },
  { id: 'ogm-10', scientificName: 'Thermococcales spp', category: 'Archaea', commonName: null },
]

async function main() {
  await prisma.ogmDonorSpecies_PL.deleteMany()
  console.log('Cleared existing OgmDonorSpecies_PL records')

  for (const record of ogmDonorSpecies) {
    await prisma.ogmDonorSpecies_PL.create({ data: record })
    console.log(`Created OgmDonorSpecies_PL: ${record.scientificName} (${record.id})`)
  }

  console.log(`All ${ogmDonorSpecies.length} OgmDonorSpecies_PL records seeded successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
