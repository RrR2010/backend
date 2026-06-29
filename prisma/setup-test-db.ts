import { execSync } from 'child_process'

async function main() {
  console.log('Setting up test database...')

  // Use a separate DB URL for tests
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    process.env.DATABASE_URL?.replace('/mydb', '/mydb_test') ||
    ''

  // Push schema
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' })

  // Run seeds
  execSync('npx ts-node prisma/seeds/index.ts', { stdio: 'inherit' })

  console.log('Test database ready.')
}

main().catch(console.error)
