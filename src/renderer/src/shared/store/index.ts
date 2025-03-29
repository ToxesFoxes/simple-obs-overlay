import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, UseDispatch, useSelector } from 'react-redux'
import obsSlice from './obs.slice'
import windowsSlice from './windows.slice'
import overlaySlice from './overlay.slice'

export const store = configureStore({
    reducer: {
        windowsSlice: windowsSlice.reducer,
        obsSlice: obsSlice.reducer,
        overlaySlice: overlaySlice.reducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type RootKeys = keyof RootState
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: UseDispatch<AppDispatch> = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const connectToObs = () => async (dispatch: AppDispatch) => {
    window.electron.ipcRenderer.send('connect-to-obs')
}