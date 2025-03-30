import storage from 'node-persist'
import { ipcMain } from 'electron'

await storage.init()

export const store = storage

export const config = {
    obs: async () => await store.getItem('obs') || {
        host: 'localhost',
        port: 4455,
        password: ''
    },
    overlay: async () => await store.getItem('overlay') || {
        showStatusText: true,
        showPauseButton: true,
        showRefreshButton: true,
        showMoveButton: true,
        defaultPosition: 'center',
        customPosition: { x: 0, y: 0 },
        idleTimeSeconds: 5,
        initialOpacity: 1,
        idleOpacity: 0.3
    }
}

// Сохранение конфигурации OBS
ipcMain.on('save-obs-config', async (_event, config) => {
    console.log('save-obs-config', config)
    await store.setItem('obs', config)
})

// Сохранение конфигурации оверлея
ipcMain.on('save-overlay-config', async (_event, config) => {
    await store.setItem('overlay', config)
})

// Получение конфигурации OBS
ipcMain.on('get-obs-config', async (event) => {
    const obsConfig = await config.obs()
    event.reply('obs-config', obsConfig)
})

// Получение конфигурации оверлея
ipcMain.on('get-overlay-config', async (event) => {
    const overlayConfig = await config.overlay()
    event.reply('overlay-config', overlayConfig)
})
