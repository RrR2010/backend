import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.dev
const envPath = resolve(__dirname, '..', '.env.dev')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  let value = trimmed.slice(eq + 1).trim()
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
  process.env[key] = value
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const existing = await prisma.plan.count()
if (existing > 0) {
  console.log(`Plans already seeded (${existing} found). Skipping.`)
  await prisma.$disconnect()
  process.exit(0)
}

const plans = [
  {
    type: 'FREE', name: 'Free',
    description: 'Get started with basic features. Perfect for testing the platform.',
    basePrice: 0, currency: 'BRL', includedUsers: 1, additionalUserPrice: null,
    maxProducts: 5, maxRevisions: 5, trialDays: null,
    features: JSON.stringify(['Basic product catalog', 'Limited revisions', 'Single user', 'Email support']),
    allowsAdditionalUsers: false, isPublic: true, isActive: true,
  },
  {
    type: 'BASIC', name: 'Basic',
    description: 'For growing businesses that need more capacity and flexibility.',
    basePrice: 9990, currency: 'BRL', includedUsers: 1, additionalUserPrice: 5000,
    maxProducts: 20, maxRevisions: null, trialDays: null,
    features: JSON.stringify(['Extended product catalog', 'Unlimited revisions', 'Additional users available', 'Email support']),
    allowsAdditionalUsers: true, isPublic: true, isActive: true,
  },
  {
    type: 'PREMIUM', name: 'Premium',
    description: 'For established businesses that need full power and priority support.',
    basePrice: 19990, currency: 'BRL', includedUsers: 5, additionalUserPrice: 5000,
    maxProducts: 100, maxRevisions: null, trialDays: null,
    features: JSON.stringify(['Large product catalog', 'Unlimited revisions', 'Team collaboration', 'Additional users available', 'Priority support']),
    allowsAdditionalUsers: true, isPublic: true, isActive: true,
  },
]

for (const plan of plans) {
  await prisma.plan.create({
    data: {
      id: crypto.randomUUID(),
      ...plan,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  console.log(`  Created plan: ${plan.type}`)
}

console.log('Done — 3 plans seeded.')
await prisma.$disconnect()
