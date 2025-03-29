import { Badge, Button, Flex, Typography } from 'antd'
import { OBSEventTypes, OBSResponseTypes } from 'obs-websocket-js'
import { useEffect, useState } from 'react'
import { DragOutlined, ReloadOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useInterval } from 'usehooks-ts'

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
    const recording = recordState === RecordStatesEnum.started || recordState === RecordStatesEnum.resumed
    const paused = recordState === RecordStatesEnum.paused

    const refresh = (): void => {
        ipc.send('obs-refresh-status')
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

    useEffect(() => {
        if (recordState == RecordStatesEnum.stopping) {
            setTimeout(() => {
                setRecordTime(0)
            }, 1000);
        }
    }, [recordState])

    // Only increment time when recording and not paused
    useInterval(() => {
        if (recording && !paused) {
            setRecordTime(prev => prev + 1)
        }
    }, (recording && !paused) ? 1000 : null)

    useEffect(() => {
        ipc.on('obs-record-status', (_, status: OBSResponseTypes['GetRecordStatus']) => {
            // Update the record time from OBS
            console.log('status', status)
            const newTime = Math.ceil(status.outputDuration / 1000)
            setRecordTime(newTime)
        })
        ipc.on('obs-record-state-changed', (_, state: OBSEventTypes['RecordStateChanged']) => {
            const currentState = state.outputState
            console.log('state', currentState)
            setRecordState(currentState as RecordStates)
        })
        refresh()
        return () => {
            ipc.removeAllListeners('obs-record-status')
            ipc.removeAllListeners('obs-record-state-changed')
        }
    }, [])

    // Determine badge status based on recording and paused state
    const getBadgeStatus = () => {
        if (recording) return 'processing'
        if (paused) return 'warning'
        return 'default'
    }

    // Get status text
    const getStatusText = () => {
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
                <Typography.Text style={{ minWidth: '40px' }}>{getStatusText()}</Typography.Text>
                <Typography.Text>{formatDuration(duration(recordTime))}</Typography.Text>

                {!recording && !paused && (
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
                    />
                )}

                {paused && (
                    <Button
                        size="small"
                        icon={<PlayCircleOutlined />}
                        onClick={resume}
                        style={{ backgroundColor: '#52c41a' }}
                    />
                )}

                {(recording || paused) && (
                    <Button
                        size="small"
                        danger
                        icon={<StopOutlined />}
                        onClick={stop}
                    />
                )}
            </Flex>
            <Flex>
                {/* <pre>{JSON.stringify({
                    paused, recordTime, recording
                })}</pre> */}
                <Button
                    type='text'
                    size='middle'
                    onClick={refresh}
                    icon={<ReloadOutlined />} />
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