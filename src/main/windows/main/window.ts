import { shell, BrowserWindow } from 'electron'
import { join } from 'path'
import icon from '../../../../resources/icon.png?asset'
import { is } from '@electron-toolkit/utils'
import { PRELOAD_DIR, RENDERER_DIR } from '../../paths'
import { bindEvents } from './events'
const {
  default: installExtension,
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS
} = require("electron-devtools-installer")

export const MainWindow = (): BrowserWindow => {
  // Create the browser window.
  const w = new BrowserWindow({
    width: 340,
    height: 108,
    show: true,
    autoHideMenuBar: true,
    resizable: false,
    transparent: true,
    frame: false,
    backgroundColor: '#00FFFFFF',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(PRELOAD_DIR, 'index.mjs'),
      sandbox: false
    }
  })
  bindEvents(w)
  w.setIgnoreMouseEvents(false, { forward: true })
  if (is.dev) {

    // Errors are thrown if the dev tools are opened
    // before the DOM is ready
    w.webContents.once("dom-ready", async () => {
      await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log("An error occurred: ", err))
        .finally(() => {
          w.webContents.openDevTools()
        })
    })
  }
  w.on('ready-to-show', () => { w.show() })

  w.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    w.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    w.loadFile(join(RENDERER_DIR, 'index.html'))
  }
  return w
}
