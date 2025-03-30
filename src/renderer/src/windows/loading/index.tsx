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
    const ipc = window.electron.ipcRenderer
    const [connectionAttempts, setConnectionAttempts] = useState(0)
    const [showConnectionTip, setShowConnectionTip] = useState(false)
    const obsConnected = useAppSelector(state => state.obsSlice.connected)
    const attemptsMade = useRef(false)

    // Используем useBoolean для управления процессом подключения
    const { value: isConnecting, setTrue: startConnecting, setFalse: stopConnecting } = useBoolean(false)

    // Функция для второй попытки подключения
    const secondConnectionAttempt = () => {
        if (!obsConnected) {
            connectToObs()
            setConnectionAttempts(2)
            // Показываем подсказку сразу после второй попытки
            setShowConnectionTip(true)
        }
        stopConnecting()
    }

    // Используем useTimeout вместо setTimeout
    useTimeout(secondConnectionAttempt, isConnecting ? 3000 : null)

    // Первая попытка подключения при загрузке компонента
    useEffect(() => {
        // Если уже подключены, ничего не делаем
        if (obsConnected) {
            return
        }

        // Если это первая загрузка компонента, пытаемся подключиться сразу
        if (!attemptsMade.current) {
            attemptsMade.current = true
            connectToObs()
            setConnectionAttempts(1)

            // Запускаем таймер для второй попытки
            startConnecting()
        }
    }, [obsConnected])

    // Отдельный эффект для отображения подсказки, если есть 2 попытки и нет подключения
    useEffect(() => {
        if (connectionAttempts >= 2 && !obsConnected) {
            setShowConnectionTip(true)
        } else if (obsConnected) {
            setShowConnectionTip(false)
        }
    }, [connectionAttempts, obsConnected])

    // Эффект для изменения размера окна при отображении ошибки
    useEffect(() => {
        if (showConnectionTip && !obsConnected) {
            ipc.send('window-change', 'loading-with-error')
        } else {
            ipc.send('window-change', 'loading')
        }
    }, [showConnectionTip, obsConnected])

    const goToConfig = () => {
        // Останавливаем процесс второй попытки подключения, если он активен
        stopConnecting()

        dispatch(changeWindow({ windowState: 'config' }))
        ipc.send('window-change', 'config')
    }

    return (
        <Flex vertical style={{
            height: '100vh', width: '100vw'
        }}>
            <Card
                style={{ height: '100%',width: '100%' }}
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
                            message="Не удается подключиться к OBS"
                            description={
                                <Paragraph>
                                    Пожалуйста, проверьте:
                                    <ul>
                                        <li>Запущен ли OBS Studio</li>
                                        <li>Включен ли WebSocket-сервер в настройках OBS</li>
                                        <li>Правильно ли указаны параметры подключения</li>
                                    </ul>
                                </Paragraph>
                            }
                            type="warning"
                            style={{ marginTop: 0, width: '100%', padding: 4,height: '100%',borderTopLeftRadius: 0,borderTopRightRadius: 0 }}
                        />
                    ) : <>
                        <Typography.Text>
                            {obsConnected
                                ? 'Подключено к OBS, переход на оверлей...'
                                : `Подключение к OBS... (попытка ${connectionAttempts}/2)`
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