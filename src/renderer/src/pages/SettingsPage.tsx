import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../shared/store'
import { saveObsConfig, updateConfig } from '../shared/store/obs.slice'
import { updateOverlaySettings, updateCustomPosition, saveOverlayConfig } from '../shared/store/overlay.slice'
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
import styled from 'styled-components'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

const StyledFormItem = styled(Form.Item)`
margin-bottom: 4px;
`

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
    const save_setting_overlay_config = () => {
        saveOverlayConfig(overlay)
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
                    <StyledFormItem label="Host">
                        <Input
                            id="host"
                            name="host"
                            value={obsConfig.host}
                            onChange={handleObsConfigChange}
                        />
                    </StyledFormItem>

                    <StyledFormItem label="Port">
                        <InputNumber
                            id="port"
                            name="port"
                            value={obsConfig.port}
                            onChange={(value) => setObsConfig({ ...obsConfig, port: Number(value) })}
                            style={{ width: '100%' }}
                        />
                    </StyledFormItem>

                    <StyledFormItem label="Password">
                        <Input.Password
                            id="password"
                            name="password"
                            value={obsConfig.password}
                            onChange={handleObsConfigChange}
                        />
                    </StyledFormItem>

                    <Button type="primary" onClick={save_setting_obs_config}>
                        Save Connection Settings
                    </Button>
                </Form>
            </Space>
        </div>
    )

    const renderOverlaySettings = () => (
        <>
            <div className="settings-tab-content">
                <Title level={3}>Display Elements</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Form layout="vertical">
                        <StyledFormItem label="Show Status Text">
                            <Switch
                                checked={overlay.showStatusText}
                                onChange={() => handleOverlayToggle('showStatusText')}
                            />
                        </StyledFormItem>

                        <StyledFormItem label="Show Pause Button">
                            <Switch
                                checked={overlay.showPauseButton}
                                onChange={() => handleOverlayToggle('showPauseButton')}
                            />
                        </StyledFormItem>

                        <StyledFormItem label="Show Refresh Button">
                            <Switch
                                checked={overlay.showRefreshButton}
                                onChange={() => handleOverlayToggle('showRefreshButton')}
                            />
                        </StyledFormItem>

                        <StyledFormItem label="Show Move Button">
                            <Switch
                                checked={overlay.showMoveButton}
                                onChange={() => handleOverlayToggle('showMoveButton')}
                            />
                        </StyledFormItem>
                    </Form>
                </Space>
            </div>
            <div className="settings-tab-content">
                <Title level={3}>Position Settings</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Form layout="vertical">
                        <StyledFormItem label="Position Type">
                            <Radio.Group
                                value={overlay.defaultPosition}
                                onChange={(e) => handlePositionTypeChange(e.target.value)}
                            >
                                <Radio value="center">Center</Radio>
                                <Radio value="custom">Custom</Radio>
                            </Radio.Group>
                        </StyledFormItem>

                        {overlay.defaultPosition === 'custom' && (
                            <div>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <StyledFormItem label="X Position">
                                            <InputNumber
                                                value={overlay.customPosition.x}
                                                onChange={(value) => handleCustomPositionChange('x', Number(value))}
                                                style={{ width: '100%' }}
                                            />
                                        </StyledFormItem>
                                    </Col>
                                    <Col span={12}>
                                        <StyledFormItem label="Y Position">
                                            <InputNumber
                                                value={overlay.customPosition.y}
                                                onChange={(value) => handleCustomPositionChange('y', Number(value))}
                                                style={{ width: '100%' }}
                                            />
                                        </StyledFormItem>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </Form>
                </Space>
            </div>
            <div className="settings-tab-content">
                <Title level={3}>Opacity & Idle Behavior</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Form layout="vertical">
                        <StyledFormItem
                            label={`Idle Time (seconds): ${overlay.idleTimeSeconds}s`}
                        >
                            <Slider
                                min={1}
                                max={60}
                                value={overlay.idleTimeSeconds}
                                onChange={(value) => handleIdleTimeChange(Number(value))}
                            />
                        </StyledFormItem>

                        <StyledFormItem
                            label={`Initial Opacity: ${overlay.initialOpacity * 100}%`}
                        >
                            <Slider
                                min={0}
                                max={1}
                                step={0.1}
                                value={overlay.initialOpacity}
                                onChange={(value) => handleOpacityChange('initialOpacity', Number(value))}
                            />
                        </StyledFormItem>

                        <StyledFormItem
                            label={`Idle Opacity: ${overlay.idleOpacity * 100}%`}
                        >
                            <Slider
                                min={0}
                                max={1}
                                step={0.1}
                                value={overlay.idleOpacity}
                                onChange={(value) => handleOpacityChange('idleOpacity', Number(value))}
                            />
                        </StyledFormItem>
                    </Form>
                </Space>
            </div>

            <Button type="primary" onClick={save_setting_overlay_config}>
                Save Overlay Settings
            </Button>
        </>
    )

    const getTabContent = () => {
        switch (activeTab) {
            case 'obs':
                return renderOBSContent()
            case 'overlay':
                return renderOverlaySettings()
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
                    <Menu.Item key="overlay">Overlay Settings</Menu.Item>
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
