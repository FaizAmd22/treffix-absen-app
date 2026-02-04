import React from 'react'


const ButtonFixBottomPopup = ({ children }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '10px',
            gap: "20px",
            paddingTop: "10px",
            fontSize: "var(--font-sm)"
        }}>
            {children}
        </div>
    )
}

export default ButtonFixBottomPopup