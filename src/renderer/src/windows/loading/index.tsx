import { Button, Card, Flex, Typography, Alert } from 'antd'
import { useAppDispatch, useAppSelector } from '../../shared/store'
import { changeWindow } from '../../shared/store/windows.slice'
import { LoadingOutlined, SettingOutlined } from '@ant-design/icons'
import { useEffect, useState, useRef } from 'react'
import { connectToObs } from '../../shared/store/obs.slice'
import { useTimeout, useBoolean } from 'usehooks-ts'
import Paragraph from 'antd/es/typography/Paragraph'

export const LoadingWindow = () => {
    const dispatch = useAppDispatch()
    const [connectionAttempts, setConnectionAttempts] = useState(0)
    const [showConnectionTip, setShowConnectionTip] = useState(false)
    const obsConnected = useAppSelector(state => state.obsSlice.connected)
    const attemptsMade = useRef(false)

    // Using useBoolean to manage the connection process
    const { value: isConnecting, setTrue: startConnecting, setFalse: stopConnecting } = useBoolean(false)

    // Function for the second connection attempt
    const secondConnectionAttempt = () => {
        if (!obsConnected) {
            connectToObs()
            setConnectionAttempts(2)
            // Show the tip immediately after the second attempt
            setShowConnectionTip(true)
        }
        stopConnecting()
    }

    // Using useTimeout instead of setTimeout
    useTimeout(secondConnectionAttempt, isConnecting ? 3000 : null)

    // First connection attempt when the component loads
    useEffect(() => {
        // If already connected, do nothing
        if (obsConnected) {
            return
        }

        // If this is the first component load, try to connect immediately
        if (!attemptsMade.current) {
            attemptsMade.current = true
            connectToObs()
            setConnectionAttempts(1)

            // Start the timer for the second attempt
            startConnecting()
        }
    }, [obsConnected])

    // Separate effect for displaying the tip if there are 2 attempts and no connection
    useEffect(() => {
        if (connectionAttempts >= 2 && !obsConnected) {
            setShowConnectionTip(true)
        } else if (obsConnected) {
            setShowConnectionTip(false)
        }
    }, [connectionAttempts, obsConnected])

    // Effect for changing the window size when displaying an error
    useEffect(() => {
        if (showConnectionTip && !obsConnected) {
            dispatch(changeWindow({ windowState: 'loading-with-error' }))
        } else {
            dispatch(changeWindow({ windowState: 'loading' }))
        }
    }, [showConnectionTip, obsConnected, dispatch])

    const goToConfig = () => {
        // Stop the second connection attempt process if it's active
        stopConnecting()
        dispatch(changeWindow({ windowState: 'config' }))
    }

    return (
        <Flex vertical style={{
            height: '100vh', width: '100vw'
        }}>
            <Card
                style={{ height: '100%', width: '100%' }}
                styles={{ body: showConnectionTip && !obsConnected ? { padding: 0 } : {} }}
                title={
                    <Flex justify='space-between'>
                        <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
                            OBS Overlay
                        </Typography.Title>

                        <Flex>
                            <Button
                                type='text'
                                size='middle'
                                onClick={goToConfig}
                                icon={<SettingOutlined />} />
                        </Flex>
                    </Flex>
                }>
                <Flex vertical gap='small' style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {showConnectionTip && !obsConnected ? (
                        <Alert
                            message="Unable to connect to OBS"
                            description={
                                <Paragraph>
                                    Please check:
                                    <ul>
                                        <li>Is OBS Studio running</li>
                                        <li>Is the WebSocket server enabled in OBS settings</li>
                                        <li>Are the connection parameters correct</li>
                                    </ul>
                                </Paragraph>
                            }
                            type="warning"
                            style={{ marginTop: 0, width: '100%', padding: 4, height: '100%', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                        />
                    ) : <>
                        <Typography.Text>
                            {obsConnected
                                ? 'Connected to OBS, redirecting to overlay...'
                                : `Connecting to OBS... (attempt ${connectionAttempts}/2)`
                            }
                        </Typography.Text>
                        <Flex>
                            <LoadingOutlined style={{ color: 'white' }} size={50} />
                        </Flex>
                    </>}
                </Flex>
            </Card >
        </Flex >
    )
}