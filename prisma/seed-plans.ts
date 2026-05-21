import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // Delete existing plans first
  await prisma.plan.deleteMany()
  console.log('Cleared existing plans')

  const plans = [
    {
      id: 'a1b2c3d4-e5f6-4790-abcd-ef1234567890',
      type: 'FREE',
      name: 'Free',
      description: 'Get started with basic features. Perfect for testing the platform.',
      basePrice: 0,
      currency: 'BRL',
      includedUsers: 1,
      additionalUserPrice: null,
      maxProducts: 5,
      maxRevisions: 5,
      trialDays: null,
      features: ['Basic product catalog', 'Limited revisions', 'Single user', 'Email support'],
      allowsAdditionalUsers: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'b2c3d4e5-f6a7-4901-bcde-f12345678901',
      type: 'BASIC',
      name: 'Basic',
      description: 'For growing businesses that need more capacity and flexibility.',
      basePrice: 9990,
      currency: 'BRL',
      includedUsers: 1,
      additionalUserPrice: 5000,
      maxProducts: 20,
      maxRevisions: null,
      trialDays: 7,
      features: ['Extended product catalog', 'Unlimited revisions', 'Additional users available', 'Email support', 'Trial period'],
      allowsAdditionalUsers: true,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'c3d4e5f6-a7b8-4012-cdef-123456789012',
      type: 'PREMIUM',
      name: 'Premium',
      description: 'For established businesses that need full power and priority support.',
      basePrice: 19990,
      currency: 'BRL',
      includedUsers: 5,
      additionalUserPrice: 5000,
      maxProducts: 100,
      maxRevisions: null,
      trialDays: 7,
      features: ['Large product catalog', 'Unlimited revisions', 'Team collaboration', 'Additional users available', 'Priority support', 'Trial period'],
      allowsAdditionalUsers: true,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  for (const plan of plans) {
    await prisma.plan.create({ data: plan })
    console.log(`Created plan: ${plan.type}`)
  }

  console.log('All plans seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
