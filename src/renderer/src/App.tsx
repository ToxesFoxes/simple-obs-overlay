import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './shared/store'
import { ConfigWindow } from './windows/config'
import { LoadingWindow } from './windows/loading'
import { OverlayWindow } from './windows/overlay'
import { setConnected, updateConfig } from './shared/store/obs.slice'
import { changeWindow } from './shared/store/windows.slice'
import { updateOverlaySettings } from './shared/store/overlay.slice'
import { useTimeout, useBoolean } from 'usehooks-ts'

function App(): JSX.Element {
  const { currentState } = useAppSelector((state) => state.windowsSlice)
  const dispatch = useAppDispatch()
  const ipc = window.electron.ipcRenderer
  const isOverlay = currentState === 'overlay'
  const isLoading = currentState === 'loading'
  const obsConnected = useAppSelector(state => state.obsSlice.connected)

  // Используем useBoolean для управления переходом на оверлей
  const { value: shouldTransition, setTrue: startTransition, setFalse: stopTransition } = useBoolean(false)

  // Загрузка конфигурации при старте приложения
  useEffect(() => {
    // Запрашиваем конфигурацию OBS
    ipc.send('get-obs-config')
    // Запрашиваем конфигурацию оверлея
    ipc.send('get-overlay-config')

    // Слушатели для получения конфигурации
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

  // Обработка изменений состояния подключения к OBS
  useEffect(() => {
    const handleObsStatus = (_event: any, data: any) => {
      console.log('obs-connect-status', data)
      if (data) {
        // Обновляем статус подключения
        dispatch(setConnected(!!data.connected))
      }
    }

    ipc.on('obs-connect-status', handleObsStatus)

    return () => {
      ipc.removeAllListeners('obs-connect-status')
    }
  }, [dispatch, ipc])

  // Функция для перехода в оверлей
  const transitionToOverlay = () => {
    if (shouldTransition) {
      dispatch(changeWindow({ windowState: 'overlay' }))
      ipc.send('window-change', 'overlay')
      stopTransition()
    }
  }

  // Используем useTimeout для перехода с задержкой
  useTimeout(transitionToOverlay, shouldTransition ? 1000 : null)

  // Отдельный эффект для реагирования на изменение статуса подключения
  useEffect(() => {
    // Если подключились и находимся в загрузочном окне, запускаем таймер перехода
    if (obsConnected && isLoading) {
      startTransition()
    } else {
      stopTransition()
    }
  }, [obsConnected, isLoading])

  return (
    <>
      {currentState === 'loading' && (<LoadingWindow />)}
      {currentState === 'overlay' && (<OverlayWindow />)}
      {currentState === 'config' && (<ConfigWindow />)}
    </>
  )
}

export default App
