import { BrowserWindow, ipcMain } from 'electron'
import { obs } from '../../api/obs'
export type WindowState = 'loading' | 'config' | 'overlay'

export const bindEvents = (w: BrowserWindow) => {
    const send = (w.webContents.send).bind(w.webContents)
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

    ipcMain.on('window-change', (_event, data: WindowState) => {
        switch (data) {
            case 'loading': {
                w.setSize(280, 108)
                w.setMaximumSize(280, 108)
                w.setResizable(false)
                w.setMaximizable(false)
                break
            }
            case 'overlay': {
                w.setSize(280, 40)
                w.setMaximumSize(280, 40)
                w.setResizable(false)
                w.setMaximizable(false)
                w.setAlwaysOnTop(true, 'screen-saver')
                break
            }
            case 'config': {
                w.setSize(800, 600)
                w.setMaximumSize(800, 600)
                w.center()
                w.setResizable(true)
                w.setMaximizable(true)
                break
            }
        }
    })

    return obs
}