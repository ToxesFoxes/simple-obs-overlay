import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '.'

export interface Position {
    x: number
    y: number
}

export interface OverlayState {
    showStatusText: boolean
    showPauseButton: boolean
    showRefreshButton: boolean
    showMoveButton: boolean
    defaultPosition: 'center' | 'custom'
    customPosition: Position
    idleTimeSeconds: number
    initialOpacity: number
    idleOpacity: number
}

const initialState: OverlayState = {
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

export const overlaySlice = createSlice({
    name: 'overlay',
    initialState,
    reducers: {
        updateOverlaySettings: (state, { payload }: PayloadAction<Partial<OverlayState>>) => {
            return { ...state, ...payload }
        },
        updateCustomPosition: (state, { payload }: PayloadAction<Position>) => {
            state.customPosition = payload
        },
        toggleOption: (state, { payload }: PayloadAction<keyof Pick<OverlayState,
            'showStatusText' | 'showPauseButton' | 'showRefreshButton' | 'showMoveButton'>>) => {
            state[payload] = !state[payload]
        }
    }
})

export const {
    updateOverlaySettings,
    updateCustomPosition,
    toggleOption
} = overlaySlice.actions

export const saveOverlayConfig = (config: OverlayState) => {
    window.electron.ipcRenderer.send('save-overlay-config', config)
}

export default overlaySlice
