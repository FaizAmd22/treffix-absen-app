import { Page, Toggle } from 'framework7-react'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../slices/settingsSlice'
import { selectLanguages } from '../../slices/languagesSlice'
import { translate } from '../../utils/translate'
import BackButton from '../../components/backButton'

const NotificationProfilePage = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [isReminderAttendance, setIsReminderAttendance] = useState(false)

    useEffect(() => {
        const savedValue = localStorage.getItem("reminderAttendance")
        setIsReminderAttendance(savedValue === "true")
    }, [])

    const handleReminderToggle = () => {
        const newValue = !isReminderAttendance
        setIsReminderAttendance(newValue)
        localStorage.setItem("reminderAttendance", newValue.toString())
    }

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "15px", marginBottom: "70px", fontSize: "14px", color: theme == "light" ? "black" : "white" }}>
                <BackButton label={translate('notification_settings_back_button', language)} />

                <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <p>{translate('notification_absence_reminder', language)}</p>
                        <Toggle
                            checked={isReminderAttendance}
                            onChange={handleReminderToggle}
                            className="custom-toggle"
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <p>{translate('notification_settings_company_news', language)}</p>
                        <Toggle defaultChecked={false} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <p>{translate('notification_settings_submission', language)}</p>
                        <Toggle defaultChecked={true} />
                    </div>
                </div>
            </div>
        </Page>
    )
}

export default NotificationProfilePage