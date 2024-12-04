import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export function sleep(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)
