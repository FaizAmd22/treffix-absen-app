import { Block, Button, Page } from 'framework7-react';
import React, { useState } from 'react';
import Verifications from './verifications';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsVerif, selectOpenVerifEmail, updateIsVerif, updateOpenVerifEmail } from '../../../slices/verficationSlice';
import BackButton from '../../../components/backButton';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import InputText from '../../../components/inputText';

const EmailSettings = () => {
    const [email, setEmail] = useState("");
    const openVerif = useSelector(selectOpenVerifEmail);
    const isVerif = useSelector(selectIsVerif);
    const dispatch = useDispatch();
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.length !== 0) {
            dispatch(updateOpenVerifEmail(true));
        }
    };

    const handleVerificationComplete = () => {
        dispatch(updateOpenVerifEmail(false));
        dispatch(updateIsVerif(true))
    };

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            {!openVerif ? (
                <Block style={{ margin: 0, paddingTop: "5px", height: "100%", color: theme === "light" ? "black" : "white" }}>
                    <BackButton label={translate('account_settings_back_button', language)} />

                    <form onSubmit={handleSubmit} style={{ marginTop: "30px" }}>
                        <InputText
                            type={"email"}
                            id={"email"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            title={translate('input_your_email', language)}
                            theme={theme}
                        />

                        {
                            !isVerif ? (
                                <p style={{ color: "var(--color-red)" }}>{translate('email_settings_email_not_verified', language)}</p>
                            ) : (
                                <p style={{ color: "var(--color-green)" }}>{translate('email_settings_email_verified', language)}</p>
                            )
                        }

                        <Button type="submit" style={{ width: "90%", backgroundColor: "var(--bg-primary-green)", color: "white", fontSize: "14px", fontWeight: "700", padding: "20px 0px", position: "fixed", bottom: "20px", textTransform: "capitalize", borderRadius: "8px" }}>
                            <p>{translate('email_settings_email_verify', language)}</p>
                        </Button>
                    </form>
                </Block>
            ) : (
                <Verifications title={translate('email_settings_email_verify', language)} onVerificationComplete={handleVerificationComplete} />
            )}
        </Page>
    );
};

export default EmailSettings;