export const buildEnvProxy = <T extends Record<string, unknown>>(source: T, transformKey: (key: string) => string) =>
    new Proxy({} as T, {
        get(_, key) {
            const keyStr = String(key)
            const envKey = transformKey ? transformKey(keyStr) : keyStr

            return source[envKey]
        },
    })