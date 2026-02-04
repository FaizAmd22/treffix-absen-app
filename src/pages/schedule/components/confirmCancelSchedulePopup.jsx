import { Button, List, ListItem, Popup, Preloader, f7 } from 'framework7-react'
import React, { useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { translate } from '../../../utils/translate'
import { selectLanguages } from '../../../slices/languagesSlice'
import { API } from '../../../api/axios'
import { showToastFailed } from '../../../functions/toast'
import MessageAlert from '../../../components/messageAlert'
import ButtonFixBottomPopup from '../../../components/buttonFixBottomPopup'
import CustomButton from '../../../components/customButton'
import ImageAlertLight from '../../../assets/messageAlert/absen-light.png'
import ImageAlertDark from '../../../assets/messageAlert/absen-dark.png'

const ConfirmCancelSchedulePopup = ({ popupOpened, setIsCancelPopup, idCard, typeCard }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [selectedDelete, setselectedDelete] = useState("one")
    const [isLoading, setIsLoading] = useState(false)
    const [sheetOpened, setSheetOpened] = useState(false);

    const fetchSubmitDelete = async () => {
        setIsLoading(true)
        console.log("selectedDelete :", selectedDelete);

        const deleteApi = selectedDelete == "one" ? `/user-schedules/${idCard}` : `/user-schedules/${idCard}?recurrence_delete_scope=all_events`
        try {
            const response = await API.delete(deleteApi, {});

            console.log("response fetchSubmitDelete :", response.data);
            setIsLoading(false)
            setIsCancelPopup(false)
            f7.views.main.router.back({ force: true });
            setSheetOpened(true)

        } catch (error) {
            console.log("error :", error);
            setIsLoading(false)
            setIsCancelPopup(false)
            showToastFailed(translate('failed_delete_schedule', language))
        }
    }

    const handleConfirmCancel = () => {
        fetchSubmitDelete()
    }

    const onClose = () => {
        setIsCancelPopup(false)
    }

    return (
        <Popup
            opened={popupOpened}
            onPopupClose={onClose}
            style={{ width: "90%", height: "auto", borderRadius: "12px", position: "absolute", top: 300, left: 20, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
        >
            <div style={{ height: 'auto', display: "flex", flexDirection: "column", justifyContent: "space-between", padding: '20px', textAlign: "center", color: theme === "light" ? "black" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "-10px", fontSize: "var(--font-lg)", fontWeight: 700 }}>
                    <p>{translate('delete_schedule', language)}</p>

                    <Button style={{ border: "none", color: theme === "light" ? "black" : "white", padding: 0, margin: 0 }} onClick={onClose}>
                        <IoMdClose size={"20px"} />
                    </Button>
                </div>

                {typeCard == "once" ? (
                    <p
                        style={{
                            color: theme === "light" ? "var(--color-dark-gray)" : "var(--bg-primary-white)",
                            fontSize: "var(--font-sm)",
                            padding: "10px 0"
                        }}
                    >
                        {translate('success_delete_schedule_text', language)}
                    </p>
                ) : (
                    <div style={{ margin: "15px 0 10px 0", textAlign: "left" }}>
                        <label className="custom-radio">
                            <input
                                type="radio"
                                name="delete-option"
                                value="one"
                                checked={selectedDelete === "one"}
                                onChange={() => setselectedDelete("one")}
                            />
                            <span>{translate('only_this_schedule', language)}</span>
                        </label>

                        <label className="custom-radio">
                            <input
                                type="radio"
                                name="delete-option"
                                value="all"
                                checked={selectedDelete === "all"}
                                onChange={() => setselectedDelete("all")}
                            />
                            <span>{translate('all_related_schedules', language)}</span>
                        </label>
                    </div>
                )}

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
                        text={isLoading ? <Preloader color="white" size={20} style={{ margin: "10px 0" }} /> : translate('delete', language)}
                        handleClick={handleConfirmCancel}
                    />
                </ButtonFixBottomPopup>
            </div>

            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={translate('success_delete_schedule', language)}
                message={translate('success_delete_schedule_text', language)}
                imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
            />
        </Popup>
    )
}

export default ConfirmCancelSchedulePopup