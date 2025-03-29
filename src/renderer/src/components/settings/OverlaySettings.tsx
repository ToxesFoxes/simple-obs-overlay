import React from 'react'
import { useAppDispatch, useAppSelector } from '../../shared/store'
import { updateOverlaySettings, updateCustomPosition, saveOverlayConfig } from '../../shared/store/overlay.slice'
import { Form, Button, Switch, Radio, Slider, InputNumber, Typography, Row, Col, Space } from 'antd'
import styled from 'styled-components'

const { Title } = Typography

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 4px;
`

const OverlaySettings: React.FC = () => {
    const dispatch = useAppDispatch()
    const overlay = useAppSelector(state => state.overlaySlice)

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

    return (
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
}

export default OverlaySettings
