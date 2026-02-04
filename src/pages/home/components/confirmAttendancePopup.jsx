import { Button, f7, Popup } from 'framework7-react'
import { IoMdClose } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { translate } from '../../../utils/translate'
import ButtonFixBottomPopup from '../../../components/buttonFixBottomPopup'
import CustomButton from '../../../components/customButton'

const ConfirmAttendancePopup = ({ popupOpened, setPopupOpened }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    const handleSubmit = () => {
        setPopupOpened(false)
        f7.views.main.router.navigate('/submit-outside-office/')
    }

    const handleCancel = () => {
        setPopupOpened(false)
        f7.views.main.router.navigate('/home/', { clearPreviousHistory: true })
    }

    return (
        <Popup
            opened={popupOpened}
            onPopupClose={() => setPopupOpened(false)}
            backdrop={true}
            closeByBackdropClick={false}
            style={{ width: "90%", height: "auto", borderRadius: "12px", position: "absolute", top: 320, left: 20, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
        >
            <div style={{ height: '80%', display: "flex", flexDirection: "column", justifyContent: "space-between", padding: '20px', textAlign: "center", color: theme === "light" ? "black" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--font-md)", fontWeight: 700, marginTop: "-10px" }}>
                    {/*<p>{translate('overtime_confirm', language)}</p>*/}
                    <p>{translate('location_not_match', language)}</p>

                    {/*<Button style={{ border: "none", color: theme === "light" ? "black" : "white", padding: 0, margin: 0 }} onClick={() => setPopupOpened(false)}>
                        <IoMdClose size={"20px"} />
                    </Button>*/}
                </div>

                <p style={{ color: theme === "light" ? "var(--color-dark-gray)" : "var(--bg-primary-white)", fontSize: "var(--font-sm)", padding: "10px 0" }}>
                    {translate('location_not_match_text', language)}
                </p>

                <ButtonFixBottomPopup>
                    <CustomButton
                        color={"var(--bg-primary-green)"}
                        bg={"transparent"}
                        border={"1px solid var(--bg-primary-green)"}
                        text={translate('procurement_cancel', language)}
                        handleClick={handleCancel}
                    />

                    <CustomButton
                        color={"white"}
                        bg={"var(--bg-primary-green)"}
                        border={"1px solid var(--bg-primary-green)"}
                        text={translate('continue_attendance', language)}
                        handleClick={handleSubmit}
                    />
                </ButtonFixBottomPopup>
            </div>
        </Popup>
    )
}

export default ConfirmAttendancePopup