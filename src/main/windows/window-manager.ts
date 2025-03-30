import { BrowserWindow } from 'electron'

export type WindowState = 'loading' | 'loading-with-error' | 'config' | 'overlay'

interface WindowConfig {
  width: number
  height: number
  resizable: boolean
  maximizable: boolean
  alwaysOnTop: boolean
  center?: boolean
  topmost?: boolean
  opacity?: number
  transitionMs?: number
}

// Define configurations for each window state
const windowConfigs: Record<WindowState, WindowConfig> = {
  'loading': {
    width: 300,
    height: 108,
    resizable: false,
    maximizable: false,
    alwaysOnTop: false,
    opacity: 1,
    center: true
  },
  'loading-with-error': {
    width: 300,
    height: 230,
    resizable: false,
    maximizable: false,
    alwaysOnTop: false,
    opacity: 1
  },
  'overlay': {
    width: 300,
    height: 40,
    resizable: false,
    maximizable: false,
    alwaysOnTop: true,
    topmost: true,
    opacity: 1,
    transitionMs: 300 // анимация перехода для оверлея
  },
  'config': {
    width: 800,
    height: 600,
    resizable: true,
    maximizable: true,
    alwaysOnTop: false,
    center: true,
    opacity: 1,
    transitionMs: 250 // анимация перехода для настроек
  }
}

/**
 * Window manager class to handle window state changes
 */
export class WindowManager {
  private window: BrowserWindow
  private currentState: WindowState = 'loading'
  private isChangingState = false
  private pendingStateChange: WindowState | null = null
  private transitionTimer: NodeJS.Timeout | null = null

  constructor(window: BrowserWindow) {
    this.window = window
  }

  /**
   * Apply window configuration based on state
   */
  public changeWindowState(newState: WindowState): void {
    // Если состояние такое же, не делаем ничего
    if (newState === this.currentState && !this.isChangingState) {
      return
    }

    // Если уже идет процесс изменения, запоминаем последнее запрошенное состояние
    if (this.isChangingState) {
      this.pendingStateChange = newState
      console.log(`Queued state change to: ${newState} (currently changing to ${this.currentState})`)
      return
    }

    const config = windowConfigs[newState]
    const prevConfig = windowConfigs[this.currentState]

    if (!config) {
      console.error(`No configuration found for window state: ${newState}`)
      return
    }

    // Очищаем предыдущий таймер анимации, если он есть
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer)
      this.transitionTimer = null
    }

    // Устанавливаем флаг, что идет процесс изменения
    this.isChangingState = true
    console.log(`Changing window state from ${this.currentState} to ${newState}`)

    // Определяем нужна ли анимация для данного перехода
    const needsTransition = (
      (this.currentState === 'config' && newState === 'overlay') ||
      (this.currentState === 'overlay' && newState === 'config')
    )

    // Для переходов между оверлеем и конфигом делаем плавную анимацию
    if (needsTransition) {
      this.animateWindowChange(prevConfig, config, newState)
    } else {
      // Для других переходов просто применяем конфигурацию
      this.applyWindowConfig(config, newState)

      // Завершаем процесс изменения
      this.finalizeStateChange(newState)
    }
  }

  /**
   * Animate window change with opacity and size transition
   */
  private animateWindowChange(prevConfig: WindowConfig, newConfig: WindowConfig, newState: WindowState): void {
    // Сначала делаем окно полупрозрачным
    this.window.setOpacity(0.4)

    // Всегда выключаем alwaysOnTop при анимации
    this.window.setAlwaysOnTop(false)

    // Задержка перед изменением размера для визуального эффекта
    setTimeout(() => {
      // Применяем новые размеры и настройки
      this.window.setSize(newConfig.width, newConfig.height)
      this.window.setMaximumSize(newConfig.width, newConfig.height)
      this.window.setResizable(newConfig.resizable)
      this.window.setMaximizable(newConfig.maximizable)

      // Центрируем окно если нужно
      if (newConfig.center) {
        this.window.center()
      }

      // Задержка перед установкой alwaysOnTop и возвращением непрозрачности
      setTimeout(() => {
        // Устанавливаем alwaysOnTop если нужно
        if (newConfig.alwaysOnTop) {
          this.window.setAlwaysOnTop(true, newConfig.topmost ? 'screen-saver' : 'normal')
        }

        // Плавно возвращаем непрозрачность
        this.window.setOpacity(1)

        // Завершаем процесс изменения после завершения анимации
        this.transitionTimer = setTimeout(() => {
          this.finalizeStateChange(newState)
        }, 200)
      }, 100)
    }, 150)
  }

  /**
   * Apply specific window configuration
   */
  private applyWindowConfig(config: WindowConfig, newState: WindowState): void {
    // Применяем настройки размера и поведения окна
    this.window.setSize(config.width, config.height)
    this.window.setMaximumSize(config.width, config.height)
    this.window.setResizable(config.resizable)
    this.window.setMaximizable(config.maximizable)

    // Особая обработка для перехода между конфигурацией и оверлеем
    if ((this.currentState === 'config' && newState === 'overlay') ||
      (this.currentState === 'overlay' && newState === 'config')) {
      // Сначала выключаем alwaysOnTop для предотвращения проблем с фокусом
      this.window.setAlwaysOnTop(false)

      // Затем устанавливаем нужный режим
      setTimeout(() => {
        if (config.alwaysOnTop) {
          this.window.setAlwaysOnTop(true, config.topmost ? 'screen-saver' : 'normal')
        }
      }, 50)
    } else {
      // Для других переходов устанавливаем режим сразу
      if (config.alwaysOnTop) {
        this.window.setAlwaysOnTop(true, config.topmost ? 'screen-saver' : 'normal')
      } else {
        this.window.setAlwaysOnTop(false)
      }
    }

    // Центрируем окно если нужно
    if (config.center) {
      this.window.center()
    }
  }

  /**
   * Finalize the state change process
   */
  private finalizeStateChange(newState: WindowState): void {
    // Обновляем текущее состояние
    this.currentState = newState

    // Завершаем процесс изменения
    this.isChangingState = false

    // Проверяем, есть ли ожидающие изменения
    if (this.pendingStateChange && this.pendingStateChange !== this.currentState) {
      const nextState = this.pendingStateChange
      this.pendingStateChange = null

      // Устанавливаем небольшой таймаут перед следующим изменением
      setTimeout(() => {
        this.changeWindowState(nextState)
      }, 100)
    }
  }

  /**
   * Get current window state
   */
  public getCurrentState(): WindowState {
    return this.currentState
  }
}