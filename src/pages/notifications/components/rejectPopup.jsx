import React, { useState } from 'react'
import { Button, Popup } from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { translate } from '../../../utils/translate'
import { IoMdClose } from 'react-icons/io'
import ButtonFixBottomPopup from '../../../components/buttonFixBottomPopup'
import CustomButton from '../../../components/customButton'
import InputTextarea from '../../../components/inputTextarea'

const RejectedPopup = ({ popupOpened, setPopupOpened, handleConfirm, id, reasonReject, setReasonReject }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    return (
        <Popup
            opened={popupOpened}
            onPopupClose={() => setPopupOpened(false)}
            style={{ width: "90%", height: "auto", borderRadius: "12px", position: "absolute", top: 180, left: 20, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
        >
            <div style={{ height: '82%', display: "flex", flexDirection: "column", gap: "0", justifyContent: "space-between", padding: '20px', color: theme === "light" ? "black" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "-10px" }}>
                    <h3>{translate('reject_submission', language)}</h3>

                    <Button style={{ border: "none", color: theme === "light" ? "black" : "white", padding: 0, margin: 0 }} onClick={() => setPopupOpened(false)}>
                        <IoMdClose size={"20px"} />
                    </Button>
                </div>

                <InputTextarea
                    title={translate('reasons_for_rejection', language)}
                    id={"reasonReject"}
                    type={"p"}
                    noMargin={false}
                    placeholder={translate('reasons_for_rejection_text', language)}
                    value={reasonReject}
                    onChange={(e) => setReasonReject(e.target.value)}
                    theme={theme}
                />

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
                        bg={"var(--color-red)"}
                        border={"1px solid var(--color-red)"}
                        text={translate('reject_submission', language)}
                        handleClick={() => handleConfirm(id, "reject")}
                    />
                </ButtonFixBottomPopup>
            </div>
        </Popup>
    )
}

export default RejectedPopup