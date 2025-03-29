import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './shared/store'
import { ConfigWindow } from './windows/config'
import { LoadingWindow } from './windows/loading'
import { OverlayWindow } from './windows/overlay'
import { setConnected } from './shared/store/obs.slice'

function App(): JSX.Element {
  const { currentState } = useAppSelector((state) => state.windowsSlice)
  const dispatch = useAppDispatch()
  const ipc = window.electron.ipcRenderer
  const isOverlay = currentState === 'overlay'
  const isLoading = currentState === 'loading'

  useEffect(() => {
    const handleObsStatus = (_event: any, data: any) => {
      console.log('obs-connect-status', data)
      if (data) {
        dispatch(setConnected(!!data.connected))
      }
    }

    ipc.on('obs-connect-status', handleObsStatus)

    return () => {
      ipc.removeAllListeners('obs-connect-status')
    }
  }, [dispatch, ipc, isOverlay, isLoading])

  return (
    <>
      {currentState === 'loading' && (<LoadingWindow />)}
      {currentState === 'overlay' && (<OverlayWindow />)}
      {currentState === 'config' && (<ConfigWindow />)}
    </>
  )
}

export default App
