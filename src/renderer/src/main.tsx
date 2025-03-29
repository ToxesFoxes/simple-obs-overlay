import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ConfigProvider, theme } from 'antd'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Provider } from 'react-redux'
import { store } from './shared/store'

dayjs.extend(duration)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider componentSize="small" theme={{
      algorithm: theme.darkAlgorithm,
      cssVar: true,
    }}>
      <Provider store={store}>
        <App />
      </Provider>
    </ConfigProvider>
  </React.StrictMode>
)
