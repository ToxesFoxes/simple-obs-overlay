import { z } from 'zod'

const configSchema = z.object({
    APP_TITLE: z.string(),
    APP_VERSION: z.string(),
})

export const parseConfig = (configObj: Record<string, unknown>) => {
    const parseResult = configSchema.safeParse(configObj)
    if (!parseResult.success) throw parseResult.error
    return parseResult.data
}