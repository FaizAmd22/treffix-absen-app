import React from 'react'
import { Button, Popup } from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { translate } from '../../../utils/translate'
import { IoMdClose } from 'react-icons/io'
import ButtonFixBottomPopup from '../../../components/buttonFixBottomPopup'
import CustomButton from '../../../components/customButton'

const ConfirmPopup = ({ popupOpened, setPopupOpened, handleConfirm, name, id }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    return (
        <Popup
            opened={popupOpened}
            onPopupClose={() => setPopupOpened(false)}
            style={{ width: "90%", height: "auto", borderRadius: "12px", position: "absolute", top: 320, left: 20, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
        >
            <div style={{ height: '80%', display: "flex", flexDirection: "column", justifyContent: "space-between", padding: '20px', textAlign: "center", color: theme === "light" ? "black" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>{translate('approve_submission', language)}</h3>

                    <Button style={{ border: "none", color: theme === "light" ? "black" : "white", padding: 0, margin: 0 }} onClick={() => setPopupOpened(false)}>
                        <IoMdClose size={"20px"} />
                    </Button>
                </div>

                <p style={{ color: theme === "light" ? "var(--color-dark-gray)" : "var(--bg-primary-white)", padding: "10px 0" }}>{translate('approve_submission_text', language)} {name}</p>

                <ButtonFixBottomPopup>
                    <CustomButton
                        color={"var(--bg-primary-green)"}
                        bg={"transparent"}
                        border={"1px solid var(--bg-primary-green)"}
                        text={translate('procurement_cancel', language)}
                        handleClick={() => setPopupOpened(false)}
                    />

                    <CustomButton
                        color={"white"}
                        bg={"var(--color-green)"}
                        border={"1px solid var(--color-green)"}
                        text={translate('approve_submission', language)}
                        handleClick={() => handleConfirm(id, "approve")}
                    />
                </ButtonFixBottomPopup>
            </div>
        </Popup>
    )
}

export default ConfirmPopup