import { Button, f7 } from 'framework7-react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { APIFaceRecog } from '../../../api/axios';
import { showToastFailed } from '../../../functions/toast';
import InputPassword from '../../../components/inputPassword';
import { z } from 'zod';

const ResetPassword = () => {
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [errors, setErrors] = useState({ newPassword: "", confirmNewPassword: "" });
    const [isLoading, setIsLoading] = useState(false);

    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const otp = localStorage.getItem("otp");

    const schema = z.object({
        newPassword: z
            .string()
            .trim()
            .min(1, "Field harus diisi")
            .min(6, translate('password_rules', language)),
        confirmNewPassword: z
            .string()
            .trim()
            .min(1, "Field harus diisi")
    }).superRefine((val, ctx) => {
        if (val.newPassword !== val.confirmNewPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password tidak sama",
                path: ["confirmNewPassword"],
            });
        }
    });

    const toggleNewPasswordVisibility = () => setNewPasswordVisible(v => !v);
    const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(v => !v);

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
        if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: "" }));
        if (errors.confirmNewPassword) setErrors(prev => ({ ...prev, confirmNewPassword: "" }));
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmNewPassword(e.target.value);
        if (errors.confirmNewPassword) setErrors(prev => ({ ...prev, confirmNewPassword: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = schema.safeParse({ newPassword, confirmNewPassword });
        if (!result.success) {
            const next = { newPassword: "", confirmNewPassword: "" };
            for (const issue of result.error.issues) {
                const path = issue.path?.[0];
                if (path && (path === "newPassword" || path === "confirmNewPassword")) {
                    next[path] = issue.message;
                }
            }
            setErrors(next);
            return;
        }

        setErrors({ newPassword: "", confirmNewPassword: "" });
        setIsLoading(true);
        try {
            const response = await APIFaceRecog.post("/auth/forgot-password/reset", {
                otp_code: otp,
                password: newPassword,
                password_confirm: confirmNewPassword,
            });
            console.log("response reset password :", response);
            localStorage.setItem('isBiometric', 'false');
            f7.views.main.router.refreshPage();
        } catch (error) {
            showToastFailed("Gagal reset Password!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ color: theme === "light" ? "black" : "white", marginBottom: "20px" }}>
            <p style={{ fontSize: "16px", fontWeight: 700, textAlign: "center" }}>
                {translate('reset_password_title', language)}
            </p>

            <form onSubmit={handleSubmit} style={{ fontSize: "14px" }}>
                <InputPassword
                    title={translate('reset_password_new_password_label', language)}
                    id={"newPassword"}
                    value={newPassword}
                    isVisible={newPasswordVisible}
                    placeholder={translate('reset_password_input_new_password', language)}
                    onChange={handleNewPasswordChange}
                    onClick={toggleNewPasswordVisibility}
                    theme={theme}
                    error={!!errors.newPassword}
                    errorMessage={errors.newPassword}
                />

                <InputPassword
                    title={translate('reset_password_confirm_new_password', language)}
                    id={"confirmNewPassword"}
                    value={confirmNewPassword}
                    isVisible={confirmPasswordVisible}
                    placeholder={translate('reset_password_enter_confirm_new_password', language)}
                    onChange={handleConfirmPasswordChange}
                    onClick={toggleConfirmPasswordVisibility}
                    theme={theme}
                    error={!!errors.confirmNewPassword}
                    errorMessage={errors.confirmNewPassword}
                />

                <Button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        backgroundColor: isLoading ? "#ccc" : "var(--bg-primary-green)",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "700",
                        padding: "25px 0px",
                        textTransform: "capitalize",
                        borderRadius: "8px",
                        marginBottom: "10px",
                        marginTop: "25px"
                    }}
                >
                    <p>{isLoading ? "Loading ..." : translate('save', language)}</p>
                </Button>
            </form>
        </div>
    );
};

export default ResetPassword;
