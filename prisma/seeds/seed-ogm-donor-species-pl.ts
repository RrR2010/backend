import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

type SeedOgmDonorSpecies = {
  scientificName: string
  commonName: string | null
  category: string | null
}

const ogmDonorSpecies: SeedOgmDonorSpecies[] = [
  { scientificName: 'Bacillus thuringiensis', category: 'Bacteria', commonName: null },
  { scientificName: 'Streptomyces viridochromogenes', category: 'Bacteria', commonName: null },
  { scientificName: 'Agrobacterium tumefaciens', category: 'Bacteria', commonName: null },
  { scientificName: 'Zea mays (milho)', category: 'Plant', commonName: null },
  { scientificName: 'Sphingobium herbicidovorans', category: 'Bacteria', commonName: null },
  { scientificName: 'Stenotrophomonas maltophilia', category: 'Bacteria', commonName: null },
  { scientificName: 'Diabrotica virgifera (besouro)', category: 'Insect', commonName: null },
  { scientificName: 'Escherichia coli', category: 'Bacteria', commonName: null },
  { scientificName: 'Dictyostelium discoideum', category: 'Amoeba', commonName: null },
  { scientificName: 'Thermococcales spp', category: 'Archaea', commonName: null },
]

async function main() {
  await prisma.ogmDonorSpecies_PL.deleteMany()
  console.log('Cleared existing OgmDonorSpecies_PL records')

  for (const record of ogmDonorSpecies) {
    await prisma.ogmDonorSpecies_PL.create({ data: { id: crypto.randomUUID(), ...record } })
    console.log(`Created OgmDonorSpecies_PL: ${record.scientificName}`)
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
