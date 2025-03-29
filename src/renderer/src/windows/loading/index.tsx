import { Button, Card, Flex, Typography } from 'antd'
import { useAppDispatch} from '../../shared/store'
import { changeWindow } from '../../shared/store/windows.slice'
import { LoadingOutlined, SettingOutlined } from '@ant-design/icons'

export const LoadingWindow = () => {
    const dispatch = useAppDispatch()
    const ipc = window.electron.ipcRenderer

    const config = () => {
        dispatch(changeWindow({ windowState: 'config' }))
        ipc.send('window-change', 'config')
    }

    return (
        <Flex vertical style={{
            height: '100vh', width: '100vw'
        }}>
            <Card
                title={
                    <Flex justify='space-between'>
                        <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
                            OBS Overlay
                        </Typography.Title>

                        <Flex>
                            <Button
                                type='text'
                                size='middle'
                                onClick={config}
                                icon={<SettingOutlined />} />
                        </Flex>
                    </Flex>
                }>
                <Flex vertical gap='small' style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Typography.Text>Connecting to OBS...</Typography.Text>
                    <Flex>
                        <LoadingOutlined style={{ color: 'white' }} size={50} />
                    </Flex>
                </Flex>
            </Card>
        </Flex>
    )
}