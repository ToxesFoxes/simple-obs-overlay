import { Flex, theme } from 'antd'
import SettingsPage from '../../pages/SettingsPage'
import { WindowDecorator } from '../../shared/components/WindowDecorator'

export const ConfigWindow = () => {
    return (
        <WindowDecorator title="Settings" >
            <SettingsPage />
        </WindowDecorator>
    )
}