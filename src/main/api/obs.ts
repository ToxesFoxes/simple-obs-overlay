import { ipcMain } from 'electron'
import { OBSWebSocket } from 'obs-websocket-js'
import { config } from '../store'

export const obs = new OBSWebSocket()
let reconnectTimeout: NodeJS.Timeout | null = null
let connectionAttempt = 0
let isConnecting = false

// Отключаем обработчик событий "ConnectionClosed", чтобы предотвратить автоматические переподключения
obs.removeAllListeners("ConnectionClosed")

export const connectToOBS = async () => {
    // Если уже идет процесс подключения, не запускаем новый
    if (isConnecting) {
        console.log("🔄 Уже идет процесс подключения, пропускаем")
        return
    }

    // Очищаем предыдущий таймер переподключения, если он был
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
    }

    isConnecting = true
    connectionAttempt++

    try {
        // Пытаемся закрыть текущее соединение сначала
        try {
            await obs.disconnect()
        } catch (error) {
            // Игнорируем ошибки при отключении
        }

        // Запрашиваем настройки OBS
        const obsConfig = await config.obs()
        const WS_URL = `ws://${obsConfig.host}:${obsConfig.port}`
        const PASSWORD: string = obsConfig.password || ""

        console.log(`🔗 Попытка ${connectionAttempt}: Подключение к OBS WebSocket ${WS_URL}`)

        // Устанавливаем таймаут для подключения (10 секунд)
        const connectPromise = obs.connect(WS_URL, PASSWORD)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Connection timeout")), 10000)
        })

        // Используем Promise.race, чтобы обработать таймаут
        const response = await Promise.race([connectPromise, timeoutPromise])

        console.log("✅ Подключение к OBS WebSocket успешно установлено")

        const res = { connected: true, state: response, status: "Connected" }
        ipcMain.emit("internal:obs-connect-status", res)

        // Устанавливаем однократный обработчик для события "ConnectionClosed"
        obs.once("ConnectionClosed", () => {
            console.log("❌ Соединение с OBS WebSocket закрыто")
            ipcMain.emit("internal:obs-connect-status", { connected: false, status: "Disconnected" })
        })

        isConnecting = false
        connectionAttempt = 0
        return res
    } catch (error) {
        console.log(`❌ Ошибка подключения к OBS WebSocket: ${error}`)

        const res = { connected: false, state: error, status: "NotConnected" }
        ipcMain.emit("internal:obs-connect-status", res)

        isConnecting = false
        return res
    }
}

ipcMain.on('connect-to-obs', async () => {
    await connectToOBS()
})
