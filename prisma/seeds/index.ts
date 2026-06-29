import { execSync } from 'child_process'
import * as path from 'path'

// Seeds directory: backend/prisma/seeds/
const seedsDir = __dirname

// Backend root directory (where .env.dev lives): backend/
const backendRoot = path.resolve(seedsDir, '..', '..')

const seedFiles = [
  'seed-allergen-pl',
  'seed-label-field-pl',
  'seed-declaration-flag-pl',
  'seed-technical-source-type-pl',
  'seed-ogm-donor-species-pl',
  'seed-product-category-pl',
  'seed-panel-geometric-format-type-pl',
  'seed-regulatory-pl',
  'seed-unit-of-measure-pl',
]

function runSeeds() {
  console.log('========================================')
  console.log('  Starting PL platform catalog seeds')
  console.log('========================================\n')

  for (const seedFile of seedFiles) {
    const seedPath = path.join(seedsDir, `${seedFile}.ts`)
    console.log(`▶ Running ${seedFile}...`)
    try {
      execSync(`ts-node "${seedPath}"`, {
        cwd: backendRoot,
        stdio: 'inherit',
        env: { ...process.env },
      })
      console.log(`✓ ${seedFile} completed successfully\n`)
    } catch (error) {
      console.error(`✗ ${seedFile} failed:`, error)
      process.exit(1)
    }
  }

  console.log('========================================')
  console.log('  All PL platform catalog seeds completed!')
  console.log('========================================')
}

runSeeds()
