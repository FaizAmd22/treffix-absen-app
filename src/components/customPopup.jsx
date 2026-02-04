import React from 'react'
import { useSelector } from 'react-redux'
import { Popup } from 'framework7-react'
import { selectSettings } from '../slices/settingsSlice'
import CustomButton from './customButton'
import ButtonFixBottomPopup from './buttonFixBottomPopup'

const CustomPopup = ({ popupOpened, setPopupOpened, handleConfirm, handleCancel, btnYes, btnNo, message, title, top = 320 }) => {
    const theme = useSelector(selectSettings)

    return (
        <Popup
            opened={popupOpened}
            onPopupClose={() => setPopupOpened(false)}
            backdrop={true}
            closeByBackdropClick={false}
            style={{ width: "90%", height: "auto", borderRadius: "12px", position: "absolute", top: top, left: 20, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
        >
            <div style={{ height: '80%', display: "flex", flexDirection: "column", justifyContent: "space-between", padding: '20px', textAlign: "center", color: theme === "light" ? "black" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--font-md)", fontWeight: 700, marginTop: "-10px" }}>
                    <p>{title}</p>
                </div>

                <p style={{ color: theme === "light" ? "var(--color-dark-gray)" : "var(--bg-primary-white)", fontSize: "var(--font-md)", padding: "15px 0" }}>{message}</p>

                {btnNo ? (
                    <ButtonFixBottomPopup>
                        <CustomButton
                            color={"var(--bg-primary-green)"}
                            bg={"transparent"}
                            border={"1px solid var(--bg-primary-green)"}
                            text={btnNo}
                            handleClick={handleCancel}
                        />

                        <CustomButton
                            color={"white"}
                            bg={"var(--bg-primary-green)"}
                            border={"1px solid var(--bg-primary-green)"}
                            text={btnYes}
                            handleClick={handleConfirm}
                        />
                    </ButtonFixBottomPopup>
                ) : (
                    <ButtonFixBottomPopup>
                        <CustomButton
                            color={"white"}
                            bg={"var(--bg-primary-green)"}
                            border={"1px solid var(--bg-primary-green)"}
                            text={btnYes}
                            handleClick={handleConfirm}
                        />
                    </ButtonFixBottomPopup>
                )}
            </div>
        </Popup>
    )
}

export default CustomPopup