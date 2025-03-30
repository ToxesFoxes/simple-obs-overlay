import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type WindowState = 'loading' | 'config' | 'overlay' | 'loading-with-error'

export interface WindowSliceState {
    currentState: WindowState
    previousState?: WindowState
    isChanging: boolean
}

const initialState: WindowSliceState = {
    currentState: 'loading',
    previousState: undefined,
    isChanging: false
}

export const windowsSlice = createSlice({
    name: 'windows',
    initialState,
    reducers: {
        changeWindow: (state, { payload: { windowState } }: PayloadAction<{
            windowState: WindowState
        }>) => {
            if(state.currentState === windowState) {
                // No state change needed, exit early
                return
            }
            // Store previous state before changing
            state.previousState = state.currentState
            state.currentState = windowState
            state.isChanging = true

            // Notify the main process about window state change
            window.electron.ipcRenderer.send('window-change', windowState)
        },
        windowStateChanged: (state, { payload }: PayloadAction<WindowState>) => {
            // Called when main process confirms window state has changed
            state.isChanging = false
            state.currentState = payload
        }
    }
})

export const {
    changeWindow,
    windowStateChanged
} = windowsSlice.actions

// Simplified function to trigger window change
export const windowChange = (windowState: WindowState) => {
    window.electron.ipcRenderer.send('window-change', windowState)
}

// Function to sync window state from main process
export const syncWindowState = async () => {
    try {
        const currentState = await window.electron.ipcRenderer.invoke('get-window-state')
        return currentState as WindowState
    } catch (error) {
        console.error('Failed to sync window state:', error)
        return 'loading' as WindowState
    }
}

export default windowsSlice
