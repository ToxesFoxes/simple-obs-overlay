import { buildEnvProxy } from './env.proxy'
import { parseConfig } from './env.schema'

const ENV = buildEnvProxy<Record<string, unknown>>(import.meta.env, key => `VITE_${key}`)

export const CONFIG = parseConfig(ENV)

export type Config = typeof CONFIG