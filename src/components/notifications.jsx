import React from 'react'
import { useSelector } from 'react-redux'
import { selectNotification } from '../slices/notificationSlice'

const Notifications = () => {
    const data = useSelector(selectNotification)


    return (
        <div style={{ background: "#D4E2FD", position: "fixed", bottom: "200px", width: "100%", height: "54px", color: "var(--bg-primary-green)" }}>
            <p>{data.message}</p>
        </div>
    )
}

export default Notifications