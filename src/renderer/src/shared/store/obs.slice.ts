import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '.'

export interface ObsState {
    connected: boolean
    config: {
        host: string
        port: number
        password: string
    }
}

const initialState: ObsState = {
    connected: false,
    config: {
        host: 'localhost',
        port: 4455,
        password: ''
    }
}

export const obsSlice = createSlice({
    name: 'obs',
    initialState,
    reducers: {
        setConnected: (state, { payload }: PayloadAction<boolean>) => {
            state.connected = payload
        },
        updateConfig: (state, { payload }: PayloadAction<Partial<ObsState['config']>>) => {
            state.config = { ...state.config, ...payload }
        }
    }
})

export const {
    setConnected,
    updateConfig
} = obsSlice.actions

export const saveObsConfig = (obsConfig: ObsState['config']) => {
    const config = obsConfig
    window.electron.ipcRenderer.send('save-obs-config', config)
}

export default obsSlice
