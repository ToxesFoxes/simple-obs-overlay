import { ipcMain } from 'electron'
import { OBSWebSocket } from 'obs-websocket-js'
import { config } from '../store'

export const obs = new OBSWebSocket()

export const connectToOBS = async () => {
    const obsConfig = await config.obs()
    const WS_URL = `ws://${obsConfig.host}:${obsConfig.port}`
    const PASSWORD: string = obsConfig.password || ""
    console.log("🔗 Подключение к OBS WebSocket", WS_URL, PASSWORD)
    return await obs.connect(WS_URL, PASSWORD).then((response) => {
        console.log("🔗 Подключение к OBS WebSocket установлено")
        const res = { connected: true, state: response, status: "Connected" }
        ipcMain.emit("internal:obs-connect-status", res)
        return res
    }).catch((response) => {
        console.log("❌ Ошибка подключения к OBS WebSocket", response)
        const res = { connected: false, state: response, status: "NotConnected" }
        ipcMain.emit("internal:obs-connect-status", res)
        return res
    })
}

ipcMain.on('connect-to-obs', async () => {
    await connectToOBS()
})

obs.on("ConnectionClosed", () => {
    console.log("🔄 Переподключение через 5 секунд...")
    setTimeout(() => connectToOBS(), 5000)
})
