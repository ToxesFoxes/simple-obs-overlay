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
}

// Define configurations for each window state
const windowConfigs: Record<WindowState, WindowConfig> = {
  'loading': {
    width: 340,
    height: 108,
    resizable: false,
    maximizable: false,
    alwaysOnTop: false,
    opacity: 1,
    center: true
  },
  'loading-with-error': {
    width: 340,
    height: 230,
    resizable: false,
    maximizable: false,
    alwaysOnTop: false,
    opacity: 1
  },
  'overlay': {
    width: 340,
    height: 40,
    resizable: true,
    maximizable: false,
    alwaysOnTop: true,
    topmost: true,
    opacity: 1
  },
  'config': {
    width: 800,
    height: 600,
    resizable: true,
    maximizable: true,
    alwaysOnTop: false,
    center: true,
    opacity: 1
  }
}

/**
 * Simple window manager class to handle window state changes
 */
export class WindowManager {
  private window: BrowserWindow
  private currentState: WindowState = 'loading'

  constructor(window: BrowserWindow) {
    this.window = window
  }

  /**
   * Change window state and apply configuration immediately
   */
  public changeWindowState(newState: WindowState): void {
    // Skip if no change
    if (newState === this.currentState) {
      return
    }

    const config = windowConfigs[newState]
    if (!config) {
      console.error(`No configuration found for window state: ${newState}`)
      return
    }

    console.log(`Changing window state from ${this.currentState} to ${newState}`, config)

    // Apply window settings directly
    this.window.setSize(config.width, config.height)
    this.window.setMinimumSize(config.width, config.height)
    this.window.setResizable(config.resizable)
    this.window.setMaximizable(config.maximizable)

    if (config.opacity !== undefined) {
      this.window.setOpacity(config.opacity)
    }

    if (config.alwaysOnTop) {
      this.window.setAlwaysOnTop(true, config.topmost ? 'screen-saver' : 'normal')
    } else {
      this.window.setAlwaysOnTop(false)
    }

    if (config.center) {
      this.window.center()
    }

    // Update state after applying settings
    this.currentState = newState
  }

  /**
   * Get current window state
   */
  public getCurrentState(): WindowState {
    return this.currentState
  }
}