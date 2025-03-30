import React, { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import ObsConnectionSettings from '../components/settings/ObsConnectionSettings'
import OverlaySettings from '../components/settings/OverlaySettings'

const { Sider, Content } = Layout

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('obs')
    const { token: { colorBgContainer } } = theme.useToken()

    const getTabContent = () => {
        switch (activeTab) {
            case 'obs':
                return <ObsConnectionSettings />
            case 'overlay':
                return <OverlaySettings />
            default:
                return <ObsConnectionSettings />
        }
    }

    return (
        <Layout style={{ height: '100%' }}>
            <Sider width={200} style={{ background: colorBgContainer, borderRight: 0, height: '100%', overflow: 'auto' }}>
                <Menu
                    mode="inline"
                    selectedKeys={[activeTab]}
                    style={{ height: '100%', borderRight: 0 }}
                    onClick={({ key }) => setActiveTab(key as string)}
                >
                    <Menu.Item key="obs">OBS Connection</Menu.Item>
                    <Menu.Item key="overlay">Overlay Settings</Menu.Item>
                </Menu>
            </Sider>
            <Layout style={{ padding: '16px', height: '100%', overflow: 'hidden' }}>
                <Content
                    style={{
                        padding: '24px',
                        margin: 0,
                        background: colorBgContainer,
                        borderRadius: 4,
                        height: '100%', width: '100%', overflowY: 'auto', overflowX: 'hidden'
                    }}
                >
                    {getTabContent()}
                </Content>
            </Layout>
        </Layout>
    )
}

export default SettingsPage
