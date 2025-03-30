import { useInterval } from 'usehooks-ts'
import { ObsStatus } from './components/obs-status'
import { FC, useEffect, useRef, useState } from 'react'
import { Flex } from 'antd'
import { useAppSelector } from '../../shared/store'

export const OverlayWindow: FC<{}> = () => {
    const [_activeTime, setActiveTime] = useState(0)
    const [isActive, setIsActive] = useState(true)
    const [_inactiveTime, setInactiveTime] = useState(0)
    const [isMouseInside, setIsMouseInside] = useState(false)
    const overlayRef = useRef<HTMLDivElement | null>(null)

    // Получаем настройки оверлея из Redux store
    const overlaySettings = useAppSelector(state => state.overlaySlice)

    useInterval(() => {
        setActiveTime((prev) => prev + 1)

        // Only increment inactive time if mouse is not inside
        if (!isMouseInside) {
            setInactiveTime(prev => {
                const newTime = prev + 1
                // Используем настройки времени бездействия из Redux
                if (newTime >= overlaySettings.idleTimeSeconds && isActive) {
                    setIsActive(false)
                }
                return newTime
            })
        }
    }, 1000)

    // Reset inactive time on mouse movement
    useEffect(() => {
        const handleMouseMove = () => {
            if (!isActive) {
                setIsActive(true)
            }
            setInactiveTime(0)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [isActive])

    // Track mouse enter/leave events for the overlay
    useEffect(() => {
        const element = overlayRef.current
        if (!element) return

        const handleMouseEnter = () => {
            setIsMouseInside(true)
            setIsActive(true)
            setInactiveTime(0)
        }

        const handleMouseLeave = () => {
            setIsMouseInside(false)
        }

        element.addEventListener('mouseenter', handleMouseEnter)
        element.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter)
            element.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [overlayRef.current])

    // Вычисляем текущую прозрачность на основе активности и настроек из Redux
    const opacity = isActive
        ? overlaySettings.initialOpacity
        : overlaySettings.idleOpacity

    return (
        <Flex
            vertical
            ref={overlayRef}
            style={{
                opacity,
                transition: 'opacity 0.3s ease-in-out',
            }}
        >
            <ObsStatus />
        </Flex>
    )
}