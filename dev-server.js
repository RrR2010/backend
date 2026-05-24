const { spawn } = require('child_process')
const path = require('path')

const nestBin = path.resolve(__dirname, 'node_modules/@nestjs/cli/bin/nest.js')

const child = spawn(process.execPath, [nestBin, 'start', '--watch'], {
  cwd: __dirname,
  stdio: 'pipe',
  windowsHide: true,
  env: { ...process.env }
})

child.stdout.on('data', (data) => process.stdout.write(data))
child.stderr.on('data', (data) => process.stderr.write(data))

child.on('close', (code) => process.exit(code))
child.on('error', (err) => {
  console.error('dev-server.js: failed to spawn nest start:', err.message)
  process.exit(1)
})

process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))
