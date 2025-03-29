import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type WindowState = 'loading' | 'config' | 'overlay'

export interface WindowSliceState {
    currentState: WindowState
    previousState?: WindowState
}

const initialState: WindowSliceState = {
    currentState: 'loading',
}

export const windowsSlice = createSlice({
    name: 'windows',
    initialState,
    reducers: {
        changeWindow: (state, { payload: { windowState } }: PayloadAction<{
            windowState: WindowState
        }>) => {
            state.previousState = state.currentState
            state.currentState = windowState
        }
    }
})

export const {
    changeWindow,
} = windowsSlice.actions
export default windowsSlice
