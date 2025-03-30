import { BrowserWindow, ipcMain } from 'electron'
import { obs } from '../../api/obs'
import { WindowManager, WindowState } from '../window-manager'

export const bindEvents = (w: BrowserWindow) => {
    const send = (w.webContents.send).bind(w.webContents)
    const windowManager = new WindowManager(w)

    // Initialize with the loading state
    windowManager.changeWindowState('loading')

    ipcMain.on("obs-refresh-status", () => {
        obs.call("GetRecordStatus").then((res) => {
            send("obs-record-status", res)
            console.log("📼 GetRecordStatus", res)
        })
    })
    ipcMain.on("obs-record-pause", () => { obs.call("PauseRecord") })
    ipcMain.on("obs-record-resume", () => { obs.call("ResumeRecord") })
    ipcMain.on("obs-record-stop", () => { obs.call("StopRecord") })
    ipcMain.on("obs-record-start", () => { obs.call("StartRecord") })

    obs.on("RecordStateChanged", (data) => {
        console.log(`📼 RecordStateChanged: active ${data.outputActive}`)
        send("obs-record-state-changed", data)
    })

    ipcMain.on('internal:obs-connect-status', (data) => {
        send("obs-connect-status", data)
    })

    // Handle window state change requests from renderer
    ipcMain.on('window-change', (_event, state: WindowState) => {
        windowManager.changeWindowState(state)
        // Notify renderer about the window state change
        send('window-state-changed', state)
    })

    // Expose method to get current window state
    ipcMain.handle('get-window-state', () => {
        return windowManager.getCurrentState()
    })

    return obs
}