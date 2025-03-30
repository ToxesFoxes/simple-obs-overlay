import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './shared/store'
import { ConfigWindow } from './windows/config'
import { LoadingWindow } from './windows/loading'
import { OverlayWindow } from './windows/overlay'
import { setConnected, updateConfig } from './shared/store/obs.slice'
import { changeWindow, windowStateChanged, syncWindowState } from './shared/store/windows.slice'
import { updateOverlaySettings } from './shared/store/overlay.slice'
import { useTimeout, useBoolean } from 'usehooks-ts'

function App(): JSX.Element {
  const { currentState } = useAppSelector((state) => state.windowsSlice)
  const dispatch = useAppDispatch()
  const ipc = window.electron.ipcRenderer
  const isLoading = currentState === 'loading' || currentState === 'loading-with-error'
  const obsConnected = useAppSelector(state => state.obsSlice.connected)

  // Using useBoolean to manage overlay transition
  const { value: shouldTransition, setTrue: startTransition, setFalse: stopTransition } = useBoolean(false)

  // Window state synchronization at startup
  useEffect(() => {
    const initializeWindowState = async () => {
      try {
        // Get current window state from main process
        const currentWindowState = await syncWindowState()

        // Update state in Redux without sending back to the main process
        dispatch(windowStateChanged(currentWindowState))
      } catch (error) {
        console.error('Failed to initialize window state:', error)
      }
    }

    initializeWindowState()

    // Subscribe to window state changes from main process
    ipc.on('window-state-changed', (_, state) => {
      dispatch(windowStateChanged(state))
    })

    return () => {
      ipc.removeAllListeners('window-state-changed')
    }
  }, [dispatch, ipc])

  // Loading configuration at application startup
  useEffect(() => {
    // Request OBS configuration
    ipc.send('get-obs-config')
    // Request overlay configuration
    ipc.send('get-overlay-config')

    // Listeners for configuration reception
    ipc.on('obs-config', (_event, config) => {
      if (config) {
        dispatch(updateConfig(config))
      }
    })

    ipc.on('overlay-config', (_event, config) => {
      if (config) {
        dispatch(updateOverlaySettings(config))
      }
    })

    return () => {
      ipc.removeAllListeners('obs-config')
      ipc.removeAllListeners('overlay-config')
    }
  }, [dispatch, ipc])

  // Handle OBS connection state changes
  useEffect(() => {
    const handleObsStatus = (_event: any, data: any) => {
      console.log('obs-connect-status', data)
      if (data) {
        // Update connection status
        dispatch(setConnected(!!data.connected))
      }
    }

    ipc.on('obs-connect-status', handleObsStatus)

    return () => {
      ipc.removeAllListeners('obs-connect-status')
    }
  }, [dispatch, ipc])

  // Function for transitioning to overlay
  const transitionToOverlay = () => {
    if (shouldTransition) {
      // Explicitly call changeWindow, which ensures that
      // the change message will be sent to the main process
      dispatch(changeWindow({ windowState: 'overlay' }))
      stopTransition()
    }
  }

  // Using useTimeout for delayed transition
  useTimeout(transitionToOverlay, shouldTransition ? 1000 : null)

  // Separate effect for reacting to connection status changes
  useEffect(() => {
    // If connected and in loading window, start transition timer
    if (obsConnected && isLoading) {
      startTransition()
    } else {
      stopTransition()
    }
  }, [obsConnected, isLoading, startTransition, stopTransition])

  return (
    <>
      {(currentState === 'loading' || currentState === 'loading-with-error') && (<LoadingWindow />)}
      {currentState === 'overlay' && (<OverlayWindow />)}
      {currentState === 'config' && (<ConfigWindow />)}
    </>
  )
}

export default App
