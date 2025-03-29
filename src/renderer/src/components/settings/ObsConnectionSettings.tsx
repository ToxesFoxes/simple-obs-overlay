import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../shared/store'
import { saveObsConfig, updateConfig } from '../../shared/store/obs.slice'
import { Form, Input, Button, InputNumber, Typography, Tag, Space } from 'antd'
import styled from 'styled-components'

const { Title, Text } = Typography

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 4px;
`

const ObsConnectionSettings: React.FC = () => {
    const dispatch = useAppDispatch()
    const obs = useAppSelector(state => state.obsSlice)
    const [obsConfig, setObsConfig] = useState(obs.config)

    const handleObsConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target
        const newValue = type === 'number' ? Number(value) : value
        setObsConfig({ ...obsConfig, [name]: newValue })
    }

    const save_setting_obs_config = () => {
        dispatch(updateConfig(obsConfig))
        saveObsConfig(obsConfig)
    }

    return (
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
}

export default ObsConnectionSettings
