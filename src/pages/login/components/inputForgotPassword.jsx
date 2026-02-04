import { Button } from 'framework7-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { translate } from '../../../utils/translate'
import InputText from '../../../components/inputText'
import { z } from 'zod'


const InputForgotPassword = ({ handleSendOtp, email, setEmail, isLoading }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    const [error, setError] = useState("");

    const emailSchema = z.object({
        email: z
            .string()
            .trim()
            .min(1, translate('field_cant_empty', language))
            .email(translate('field_email_not_valid', language)),
    });

    const handleLocalSubmit = (e) => {
        e.preventDefault();
        const result = emailSchema.safeParse({ email });
        if (!result.success) {
            const msg = result.error.issues[0]?.message || "Field tidak valid";
            setError(msg);
            return;
        }
        setError("");
        if (typeof handleSendOtp === "function") handleSendOtp(e);
    };

    const onChangeEmail = (e) => {
        setEmail(e.target.value);
        if (error) setError("");
    };

    return (
        <div style={{ color: theme === "light" ? "black" : "white" }}>
            <p style={{ fontSize: "16px", fontWeight: 700, textAlign: "center" }}>
                {translate('forgot_password_title', language)}
            </p>

            <p style={{ textAlign: "center", color: "var(--color-dark-gray)", fontSize: "14px" }}>
                {translate('forgot_password_enter_email_label', language)}
            </p>

            <form onSubmit={handleLocalSubmit} style={{ padding: "20px 0 30px 0", fontSize: "14px" }}>
                <InputText
                    type={"text"}
                    id={"email"}
                    value={email}
                    onChange={onChangeEmail}
                    title={"Email"}
                    placeholder={translate('forgot_password_input_email', language)}
                    theme={theme}
                    error={!!error}
                    errorMessage={error}
                />

                <Button
                    disabled={isLoading}
                    type="submit"
                    style={{
                        width: "100%",
                        backgroundColor: isLoading ? "#ccc" : "var(--bg-primary-green)",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "700",
                        padding: "25px 0px",
                        textTransform: "capitalize",
                        borderRadius: "8px",
                        marginTop: "40px"
                    }}
                >
                    <p>{isLoading ? "Loading ..." : translate('forgot_password_send_code', language)}</p>
                </Button>
            </form>
        </div>
    )
}

export default InputForgotPassword
