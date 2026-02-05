import { f7, Popup } from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { translate } from '../../../utils/translate'
import { BiometricAuth } from '../../../functions/biometricAuth'
import { showToast } from '../../../functions/toast'
import ButtonFixBottomPopup from '../../../components/buttonFixBottomPopup'
import CustomButton from '../../../components/customButton'

const SaveBioMetricPopup = ({ popupOpened, setPopupOpened, token }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    const handleSubmit = async () => {
        const isBiometricAvailable = await BiometricAuth.isAvailable();
        if (isBiometricAvailable) {
            await BiometricAuth.saveToken(token, language);
            localStorage.setItem('isBiometric', 'true');

            showToast(translate('alert_biometric_saved', language), theme)
        }

        setPopupOpened(false)
        f7.views.main.router.navigate('/home/', {
            reloadCurrent: false,
            replaceState: true,
            clearPreviousHistory: true,
        });
    }

    const handleCancel = () => {
        setPopupOpened(false)
        localStorage.setItem('isBiometric', 'false');
        f7.views.main.router.navigate('/home/', {
            reloadCurrent: false,
            replaceState: true,
            clearPreviousHistory: true,
        });
    }

    return (
        <Popup
            opened={popupOpened}
            onPopupClose={() => setPopupOpened(false)}
            backdrop={true}
            closeByBackdropClick={false}
            style={{ width: "90%", height: "auto", borderRadius: "12px", position: "absolute", top: 300, left: 20, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
        >
            <div style={{ height: '80%', display: "flex", flexDirection: "column", justifyContent: "space-between", padding: '20px', textAlign: "center", color: theme === "light" ? "black" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--font-md)", fontWeight: 700, marginTop: "-10px" }}>
                    <p>{translate('otp_input_add_fingerprint', language)}</p>
                </div>

                <p style={{ color: theme === "light" ? "var(--color-dark-gray)" : "var(--bg-primary-white)", fontSize: "var(--font-sm)", padding: "10px 0" }}>{translate('otp_input_confirm_fingerprint', language)}</p>

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
                        text={translate('save', language)}
                        handleClick={handleSubmit}
                    />
                </ButtonFixBottomPopup>
            </div>
        </Popup>
    )
}

export default SaveBioMetricPopup