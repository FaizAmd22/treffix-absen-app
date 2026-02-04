import { Button, Popup, Preloader, f7 } from 'framework7-react'
import React, { useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { selectSettings } from '../slices/settingsSlice'
import { translate } from '../utils/translate'
import { selectLanguages } from '../slices/languagesSlice'
import { API } from '../api/axios'
import { showToast, showToastFailed } from '../functions/toast'
import MessageAlert from './messageAlert'
import CustomButton from './customButton'
import ButtonFixBottomPopup from './buttonFixBottomPopup'
import ImageAlertLight from '../assets/messageAlert/cancel-light.png'
import ImageAlertDark from '../assets/messageAlert/cancel-dark.png'

const ConfirmCancelPopup = ({ popupOpened, setIsCancelConfirmPopup, setIsCancelPopup, idCard, onCancelSuccess }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    // const token = localStorage.getItem("token")
    const [isLoading, setIsLoading] = useState(false)
    const [sheetOpened, setSheetOpened] = useState(false);

    const fetchSubmitDelete = async () => {
        setIsLoading(true)
        try {
            const response = await API.put(`/mobile/form-request-cancel/${idCard}`, {});

            // console.log("response fetchCount :", response.data);
            setIsLoading(false)

            // f7.dialog.alert(translate('reimburse_submission_canceled', language), () => {
            //     setIsCancelConfirmPopup(false)
            //     setIsCancelPopup(false)
            //     onCancelSuccess();
            // });
            setIsCancelConfirmPopup(false)
            setIsCancelPopup(false)
            onCancelSuccess();
            // showToast(translate('reimburse_submission_canceled', language), theme)
            setSheetOpened(true)

        } catch (error) {
            console.log("error :", error);
            setIsLoading(false)
            // f7.dialog.alert(translate('reimburse_submission_canceled_failed', language), () => {
            //     setIsCancelConfirmPopup(false)
            //     setIsCancelPopup(false)
            // });
            setIsCancelConfirmPopup(false)
            setIsCancelPopup(false)
            showToastFailed(translate('reimburse_submission_canceled_failed', language))
        }
    }

    const handleConfirmCancel = () => {
        fetchSubmitDelete()
    }

    const onClose = () => {
        setIsCancelConfirmPopup(false)
        setIsCancelPopup(true)
    }

    return (
        <Popup
            opened={popupOpened}
            onPopupClose={onClose}
            style={{ width: "90%", height: "auto", borderRadius: "12px", position: "absolute", top: "35%", left: 20, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
        >
            <div style={{ height: '80%', display: "flex", flexDirection: "column", justifyContent: "space-between", padding: '20px', textAlign: "center", color: theme === "light" ? "black" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "-10px", fontSize: "var(--font-lg)", fontWeight: 700 }}>
                    <p>{translate('cancellation_submission', language)}</p>

                    <Button style={{ border: "none", color: theme === "light" ? "black" : "white", padding: 0, margin: 0 }} onClick={onClose}>
                        <IoMdClose size={"20px"} />
                    </Button>
                </div>

                <p style={{ color: theme === "light" ? "var(--color-dark-gray)" : "var(--bg-primary-white)", fontSize: "var(--font-sm)", padding: "10px 0" }}>{translate('asking_cancel', language)}</p>

                <ButtonFixBottomPopup>
                    <CustomButton
                        color={"var(--bg-primary-green)"}
                        bg={"transparent"}
                        border={"1px solid var(--bg-primary-green)"}
                        opacity={isLoading ? 0.7 : 1}
                        text={translate('back', language)}
                        handleClick={onClose}
                    />

                    <CustomButton
                        color={"white"}
                        bg={"var(--bg-primary-green)"}
                        border={"1px solid var(--bg-primary-green)"}
                        opacity={isLoading ? 0.7 : 1}
                        text={isLoading ? <Preloader color="white" size={20} style={{ margin: "10px 0" }} /> : translate('cancel', language)}
                        handleClick={handleConfirmCancel}
                    />
                </ButtonFixBottomPopup>
            </div>

            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={translate('submission_canceled', language)}
                message={translate('submission_canceled_text', language)}
                imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
            />
        </Popup>
    )
}

export default ConfirmCancelPopup