import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../shared/store'
import { saveObsConfig, updateConfig } from '../shared/store/obs.slice'
import { updateOverlaySettings, updateCustomPosition } from '../shared/store/overlay.slice'
import {
    Layout,
    Menu,
    Form,
    Input,
    Button,
    Switch,
    Radio,
    Slider,
    InputNumber,
    Typography,
    Tag,
    Row,
    Col,
    Space,
    theme
} from 'antd'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

const SettingsPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const obs = useAppSelector(state => state.obsSlice)
    const overlay = useAppSelector(state => state.overlaySlice)
    const { token: { colorBgContainer } } = theme.useToken()

    const [obsConfig, setObsConfig] = useState(obs.config)
    const [activeTab, setActiveTab] = useState('obs')

    const handleObsConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target
        const newValue = type === 'number' ? Number(value) : value
        setObsConfig({ ...obsConfig, [name]: newValue })
    }

    const save_setting_obs_config = () => {
        dispatch(updateConfig(obsConfig))
        saveObsConfig(obsConfig)
    }

    const handleOverlayToggle = (setting: keyof typeof overlay) => {
        dispatch(updateOverlaySettings({ [setting]: !overlay[setting] }))
    }

    const handlePositionTypeChange = (type: 'center' | 'custom') => {
        dispatch(updateOverlaySettings({ defaultPosition: type }))
    }

    const handleCustomPositionChange = (axis: 'x' | 'y', value: number) => {
        dispatch(updateCustomPosition({
            ...overlay.customPosition,
            [axis]: value
        }))
    }

    const handleOpacityChange = (type: 'initialOpacity' | 'idleOpacity', value: number) => {
        dispatch(updateOverlaySettings({ [type]: value }))
    }

    const handleIdleTimeChange = (seconds: number) => {
        dispatch(updateOverlaySettings({ idleTimeSeconds: seconds }))
    }

    const renderOBSContent = () => (
        <div className="settings-tab-content">
            <Title level={3}>OBS Connection</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                    <Text>Status: </Text>
                    <Tag color={obs.connected ? 'success' : 'error'}>
                        {obs.connected ? 'Connected' : 'Disconnected'}
                    </Tag>
                </div>

                <Form layout="vertical">
                    <Form.Item label="Host">
                        <Input
                            id="host"
                            name="host"
                            value={obsConfig.host}
                            onChange={handleObsConfigChange}
                        />
                    </Form.Item>

                    <Form.Item label="Port">
                        <InputNumber
                            id="port"
                            name="port"
                            value={obsConfig.port}
                            onChange={(value) => setObsConfig({ ...obsConfig, port: Number(value) })}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Password">
                        <Input.Password
                            id="password"
                            name="password"
                            value={obsConfig.password}
                            onChange={handleObsConfigChange}
                        />
                    </Form.Item>

                    <Button type="primary" onClick={save_setting_obs_config}>
                        Save Connection Settings
                    </Button>
                </Form>
            </Space>
        </div>
    )

    const renderDisplayElements = () => (
        <div className="settings-tab-content">
            <Title level={3}>Display Elements</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Form layout="vertical">
                    <Form.Item label="Show Status Text">
                        <Switch
                            checked={overlay.showStatusText}
                            onChange={() => handleOverlayToggle('showStatusText')}
                        />
                    </Form.Item>

                    <Form.Item label="Show Pause Button">
                        <Switch
                            checked={overlay.showPauseButton}
                            onChange={() => handleOverlayToggle('showPauseButton')}
                        />
                    </Form.Item>

                    <Form.Item label="Show Refresh Button">
                        <Switch
                            checked={overlay.showRefreshButton}
                            onChange={() => handleOverlayToggle('showRefreshButton')}
                        />
                    </Form.Item>

                    <Form.Item label="Show Move Button">
                        <Switch
                            checked={overlay.showMoveButton}
                            onChange={() => handleOverlayToggle('showMoveButton')}
                        />
                    </Form.Item>
                </Form>
            </Space>
        </div>
    )

    const renderPositionSettings = () => (
        <div className="settings-tab-content">
            <Title level={3}>Position Settings</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Form layout="vertical">
                    <Form.Item label="Position Type">
                        <Radio.Group
                            value={overlay.defaultPosition}
                            onChange={(e) => handlePositionTypeChange(e.target.value)}
                        >
                            <Radio value="center">Center</Radio>
                            <Radio value="custom">Custom</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {overlay.defaultPosition === 'custom' && (
                        <div>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="X Position">
                                        <InputNumber
                                            value={overlay.customPosition.x}
                                            onChange={(value) => handleCustomPositionChange('x', Number(value))}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Y Position">
                                        <InputNumber
                                            value={overlay.customPosition.y}
                                            onChange={(value) => handleCustomPositionChange('y', Number(value))}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Form>
            </Space>
        </div>
    )

    const renderOpacitySettings = () => (
        <div className="settings-tab-content">
            <Title level={3}>Opacity & Idle Behavior</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Form layout="vertical">
                    <Form.Item
                        label={`Idle Time (seconds): ${overlay.idleTimeSeconds}s`}
                    >
                        <Slider
                            min={1}
                            max={60}
                            value={overlay.idleTimeSeconds}
                            onChange={(value) => handleIdleTimeChange(Number(value))}
                        />
                    </Form.Item>

                    <Form.Item
                        label={`Initial Opacity: ${overlay.initialOpacity * 100}%`}
                    >
                        <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={overlay.initialOpacity}
                            onChange={(value) => handleOpacityChange('initialOpacity', Number(value))}
                        />
                    </Form.Item>

                    <Form.Item
                        label={`Idle Opacity: ${overlay.idleOpacity * 100}%`}
                    >
                        <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={overlay.idleOpacity}
                            onChange={(value) => handleOpacityChange('idleOpacity', Number(value))}
                        />
                    </Form.Item>
                </Form>
            </Space>
        </div>
    )

    const getTabContent = () => {
        switch (activeTab) {
            case 'obs':
                return renderOBSContent()
            case 'display':
                return renderDisplayElements()
            case 'position':
                return renderPositionSettings()
            case 'opacity':
                return renderOpacitySettings()
            default:
                return renderOBSContent()
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
                    <Menu.ItemGroup title="Overlay Settings">
                        <Menu.Item key="display">Display Elements</Menu.Item>
                        <Menu.Item key="position">Position</Menu.Item>
                        <Menu.Item key="opacity">Opacity & Idle</Menu.Item>
                    </Menu.ItemGroup>
                </Menu>
            </Sider>
            <Layout style={{ padding: 16, height: '100%', overflow: 'auto' }}>
                <Content
                    style={{
                        padding: 24,
                        margin: 0,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: 4,
                        height: '100%',
                        overflow: 'auto'
                    }}
                >
                    {getTabContent()}
                </Content>
            </Layout>
        </Layout>
    )
}

export default SettingsPage
