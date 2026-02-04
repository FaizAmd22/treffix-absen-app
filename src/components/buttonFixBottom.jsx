import React from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../slices/settingsSlice'

const ButtonFixBottom = ({ children, needBorderTop, needShadow = false, hide = false }) => {
    const theme = useSelector(selectSettings)

    return (
        <div style={{
            width: "100%",
            height: "80px",
            borderTop: (theme === "light" && needBorderTop) ? "1px solid var(--border-primary-gray)" : (theme !== "light" && needBorderTop) ? "1px solid #363636" : "none",
            background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)",
            zIndex: 999,
            position: "fixed",
            bottom: "0",
            display: hide ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: needShadow ? "0 -2px 16px 0 rgba(0, 0, 0, 0.05)" : "none"
        }}>
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 15px" }}>
                {children}
            </div>
        </div>
    )
}

export default ButtonFixBottom