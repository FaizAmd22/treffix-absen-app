import { Block, List, ListItem, Page, f7 } from 'framework7-react'
import React from 'react'
import BackButton from '../../components/backButton'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../slices/settingsSlice'
import { selectLanguages } from '../../slices/languagesSlice'
import { translate } from '../../utils/translate'
import { API } from '../../api/axios'
import { selectUser } from '../../slices/userSlice'

const AccountSettingsPage = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const user = useSelector(selectUser)

    const SendOtp = async () => {
        try {
            const responseSendOTP = await API.post('/auth/forgot-password/send-otp', {
                method: "email",
                value: user.email,
            });
            console.log('OTP Sended:', responseSendOTP.data);
        } catch (error) {
            console.error('Failed to send OTP:', error);
            f7.dialog.confirm("Gagal kirim OTP")
        }
    };

    const handleLink = async () => {
        await SendOtp()
        f7.views.main.router.navigate("/update-password/")
    }

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "10px 18px", marginBottom: "20px", color: theme == "light" ? "black" : "white" }}>
                <BackButton label={translate('account_settings_back_button', language)} />

                <List style={{ marginTop: "20px", fontSize: "var(--font-sm)" }}>
                    <ListItem onClick={handleLink}>
                        <p style={{ color: theme === "light" ? "black" : "white" }}>{translate('account_settings_change_password', language)}</p>
                    </ListItem>
                </List>
            </div>
        </Page>
    )
}

export default AccountSettingsPage