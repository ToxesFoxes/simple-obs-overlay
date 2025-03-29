import React from 'react'
import { Button, Layout, Space, theme, Typography } from 'antd'
import { MinusOutlined, BorderOutlined, CloseOutlined } from '@ant-design/icons'
import styled from 'styled-components'

const { Header, Content } = Layout

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-app-region: drag;
  height: 32px;
  padding: 0 16px;
`

const WindowTitle = styled(Typography.Text)`
  color: #dcddde;
  font-size: 14px;
  font-weight: 500;
`

const WindowControls = styled(Space)`
  -webkit-app-region: no-drag;
`

const WindowLayout = styled(Layout)`
  height: 100vh;
  width: 100vw;
  background: #2f3136;
`

interface WindowDecoratorProps {
    title: string
    children: React.ReactNode
}

export const WindowDecorator: React.FC<WindowDecoratorProps> = ({ title, children }) => {
    const { token: { colorBgElevated, borderRadiusLG } } = theme.useToken()
    const handleMinimize = () => {
        window.electron.ipcRenderer.send('window-minimize')
    }

    const handleMaximize = () => {
        window.electron.ipcRenderer.send('window-maximize')
    }

    const handleClose = () => {
        window.electron.ipcRenderer.send('window-close')
    }

    return (
        <WindowLayout style={{ borderRadius: borderRadiusLG }}>
            <StyledHeader style={{ background: colorBgElevated }}>
                <WindowTitle>{title}</WindowTitle>
                <WindowControls>
                    <Button
                        type="text"
                        icon={<MinusOutlined />}
                        onClick={handleMinimize}
                    />
                    <Button
                        type="text"
                        icon={<BorderOutlined />}
                        onClick={handleMaximize}
                    />
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={handleClose}
                        className="close-button"
                    />
                </WindowControls>
            </StyledHeader>
            <Content>
                {children}
            </Content>
        </WindowLayout>
    )
}
