import { server } from './global-setup.js'

async function globalTeardown() {
  server.close()
}

export default globalTeardown
