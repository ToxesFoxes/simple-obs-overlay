import { Button, Form, Slider, Space, Switch, Typography } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../../../../shared/store'
import { saveOverlayConfig, updateOverlaySettings } from '../../../../shared/store/overlay.slice'

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

                        <StyledFormItem label="Show Time Text">
                            <Switch
                                checked={overlay.showTimeText}
                                onChange={() => handleOverlayToggle('showTimeText')}
                            />
                        </StyledFormItem>

                        <StyledFormItem label="Show Refresh Button">
                            <Switch
                                checked={overlay.showRefreshButton}
                                onChange={() => handleOverlayToggle('showRefreshButton')}
                            />
                        </StyledFormItem>
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
