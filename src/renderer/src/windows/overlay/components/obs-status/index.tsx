import { DragOutlined, PauseCircleOutlined, PlayCircleOutlined, ReloadOutlined, SettingOutlined, StopOutlined } from '@ant-design/icons'
import { Badge, Button, Flex, Typography } from 'antd'
import dayjs from 'dayjs'
import { OBSEventTypes, OBSResponseTypes } from 'obs-websocket-js'
import { useEffect, useState } from 'react'
import { useInterval } from 'usehooks-ts'
import { useAppDispatch, useAppSelector } from '../../../../shared/store'
import { changeWindow } from '../../../../shared/store/windows.slice'

export const duration = (time: number) => {
    const d = dayjs.duration(time, 'seconds')
    const years = d.years()
    const months = d.months()
    const days = d.days()
    const hours = d.hours()
    const minutes = d.minutes()
    const seconds = d.seconds()
    return { years, months, days, hours, minutes, seconds }
}
const formatDuration = (durationObj: ReturnType<typeof duration>) => {
    return [
        durationObj.hours.toString().padStart(2, '0'),
        durationObj.minutes.toString().padStart(2, '0'),
        durationObj.seconds.toString().padStart(2, '0'),
    ].filter(Boolean).join(':')
}

type RecordStates = 'OBS_WEBSOCKET_OUTPUT_STARTED' | 'OBS_WEBSOCKET_OUTPUT_STOPPING' | 'OBS_WEBSOCKET_OUTPUT_PAUSED' | 'OBS_WEBSOCKET_OUTPUT_RESUMED'

enum RecordStatesEnum {
    started = 'OBS_WEBSOCKET_OUTPUT_STARTED',
    stopping = 'OBS_WEBSOCKET_OUTPUT_STOPPING',
    paused = 'OBS_WEBSOCKET_OUTPUT_PAUSED',
    resumed = 'OBS_WEBSOCKET_OUTPUT_RESUMED',
}

export const ObsStatus = () => {
    const [recordState, setRecordState] = useState<RecordStates | null>(null)
    const [recordTime, setRecordTime] = useState(0)
    const ipc = window.electron.ipcRenderer
    const dispatch = useAppDispatch()

    const overlaySettings = useAppSelector(state => state.overlaySlice)
    const obsConnected = useAppSelector(state => state.obsSlice.connected)
    const recording = recordState === RecordStatesEnum.started || recordState === RecordStatesEnum.resumed
    const paused = recordState === RecordStatesEnum.paused

    const refresh = (): void => {
        ipc.send('obs-refresh-status')
    }

    const handleColdStart = (status: OBSResponseTypes['GetRecordStatus']) => {
        if (status.outputActive) {
            setRecordTime(Math.ceil(status.outputDuration / 1000))
            setRecordState(RecordStatesEnum.started)
        } else if (status.outputPaused) {
            setRecordTime(Math.ceil(status.outputDuration / 1000))
            setRecordState(RecordStatesEnum.paused)
        } else {
            setRecordTime(0)
            setRecordState(null)
        }
    }

    const pause = (): void => {
        ipc.send('obs-record-pause'); refresh()
    }
    const resume = (): void => {
        ipc.send('obs-record-resume'); refresh()
    }
    const stop = (): void => {
        ipc.send('obs-record-stop'); refresh()
    }
    const start = (): void => {
        ipc.send('obs-record-start'); refresh()
    }

    const goToSettings = () => {
        dispatch(changeWindow({ windowState: 'config' }))
    }

    useEffect(() => {
        if (recordState == RecordStatesEnum.stopping) {
            setTimeout(() => {
                setRecordTime(0)
            }, 1000)
        }
    }, [recordState])

    useInterval(() => {
        if (recording && !paused) {
            setRecordTime(prev => prev + 1)
        }
    }, (recording && !paused) ? 1000 : null)

    useEffect(() => {
        ipc.on('obs-record-status', (_, status: OBSResponseTypes['GetRecordStatus']) => {
            const newTime = Math.ceil(status.outputDuration / 1000)
            setRecordTime(newTime)

            if (recordState === null) {
                handleColdStart(status)
            }
        })
        ipc.on('obs-record-state-changed', (_, state: OBSEventTypes['RecordStateChanged']) => {
            const currentState = state.outputState
            setRecordState(currentState as RecordStates)
        })
        refresh()
        return () => {
            ipc.removeAllListeners('obs-record-status')
            ipc.removeAllListeners('obs-record-state-changed')
        }
    }, [])

    const getBadgeStatus = () => {
        if (!obsConnected) return 'error'
        if (recording) return 'processing'
        if (paused) return 'warning'
        return 'default'
    }

    const getStatusText = () => {
        if (!obsConnected) return 'Нет соединения'
        if (recording) return 'Запись'
        if (paused) return 'Пауза'
        return 'Готов'
    }

    return (
        <Flex
            justify='space-between'
            align="center"
            gap='small'
            style={{
                background: 'var(--color-background)',
                width: '100vw',
                height: '100vh',
                borderRadius: 8,
                border: '1px solid #000',
            }} >
            <Flex
                gap='small'
                style={{
                    padding: 8,
                }}
            >
                <Badge status={getBadgeStatus()} />

                {overlaySettings.showStatusText && (
                    <>
                        <Typography.Text style={{ minWidth: '40px' }}>{getStatusText()}</Typography.Text>
                        <Typography.Text>{formatDuration(duration(recordTime))}</Typography.Text>
                    </>
                )}

                {overlaySettings.showPauseButton && (
                    <>
                        {!recording && !paused && obsConnected && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlayCircleOutlined />}
                                onClick={start}
                                style={{ backgroundColor: '#52c41a' }}
                            />
                        )}

                        {recording && !paused && (
                            <Button
                                size="small"
                                icon={<PauseCircleOutlined />}
                                onClick={pause}
                                style={{ backgroundColor: '#faad14', color: '#000' }}
                                disabled={!obsConnected}
                            />
                        )}

                        {paused && (
                            <Button
                                size="small"
                                icon={<PlayCircleOutlined />}
                                onClick={resume}
                                style={{ backgroundColor: '#52c41a' }}
                                disabled={!obsConnected}
                            />
                        )}

                        {(recording || paused) && (
                            <Button
                                size="small"
                                danger
                                icon={<StopOutlined />}
                                onClick={stop}
                                disabled={!obsConnected}
                            />
                        )}
                    </>
                )}
            </Flex>
            <Flex>
                {overlaySettings.showRefreshButton && (
                    <Button
                        type='text'
                        size='middle'
                        onClick={refresh}
                        icon={<ReloadOutlined />}
                        disabled={!obsConnected}
                    />
                )}

                <Button
                    type='text'
                    size='middle'
                    onClick={goToSettings}
                    icon={<SettingOutlined />} />
                <Button
                    type='text'
                    size='middle'
                    icon={<DragOutlined />}
                    style={{
                        cursor: 'move',
                        //@ts-ignore
                        WebkitAppRegion: 'drag',
                    }} />
            </Flex>
        </Flex>
    )
}