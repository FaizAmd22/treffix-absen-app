import { Block, Button, f7, Page } from 'framework7-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectOpenVerifPassword, updateIsVerif, updateOpenVerifPassword } from '../../../slices/verficationSlice';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { API } from '../../../api/axios';
import BackButton from '../../../components/backButton';
import { showToastFailed } from '../../../functions/toast';
import LoadingPopup from '../../../components/loadingPopup';
import MessageAlertUpdatePassword from './MessageAlertUpdatePassword';
import ButtonFixBottom from '../../../components/buttonFixBottom';
import CustomButton from '../../../components/customButton';
import InputPassword from '../../../components/inputPassword';
import ImageAlertLight from '../../../assets/messageAlert/password-update-light.png'
import ImageAlertDark from '../../../assets/messageAlert/password-update-dark.png'

const UpdatePassword = () => {
    const [passwordOld, setPasswordOld] = useState("");
    const [passwordNew, setPasswordNew] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [passwordOldVisible, setPasswordOldVisible] = useState(false);
    const [passwordNewVisible, setPasswordNewVisible] = useState(false);
    const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [sheetOpened, setSheetOpened] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [confirmErrorMessage, setConfirmErrorMessage] = useState("");
    const openVerif = useSelector(selectOpenVerifPassword);
    const dispatch = useDispatch();
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const selectedOtp = useSelector((state) => state.otps.otp);

    console.log("selectedOtp :", selectedOtp);

    const togglePasswordVisibility = () => {
        setPasswordOldVisible(!passwordOldVisible);
    };

    const togglePasswordNewVisibility = () => {
        setPasswordNewVisible(!passwordNewVisible);
    };

    const togglePasswordConfirmVisibility = () => {
        setPasswordConfirmVisible(!passwordConfirmVisible);
    };

    const validatePassword = (password) => {
        const minLength = 6;
        // const hasUpperCase = /[A-Z]/.test(password);
        // const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        // const hasNumber = /[0-9]/.test(password);
        // return password.length >= minLength && hasUpperCase && hasSymbol && hasNumber;
        return password.length >= minLength;
    };


    const validatePasswordsMatch = () => {
        if (passwordNew !== passwordConfirm) {
            setConfirmErrorMessage(translate('update_password_confirm_new_password_error', language));
            return false;
        }
        setConfirmErrorMessage("");
        return true;
    };

    // useEffect(() => {
    //     if (showLoading) {
    //         f7.dialog.preloader('Loading...');
    //     } else {
    //         f7.dialog.close();
    //     }
    // }, [showLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowLoading(true);
        setErrorMessage("");
        setConfirmErrorMessage("");

        if (!validatePassword(passwordNew)) {
            setErrorMessage(translate('password_rules', language));
            setShowLoading(false);
            return;
        }

        if (!validatePasswordsMatch()) {
            setShowLoading(false);
            return;
        }

        try {
            const resetResponse = await API.put('/auth/change-password', {
                password_old: passwordOld,
                password_new: passwordNew,
                password_confirm: passwordConfirm
            });

            console.log('Password reset successful:', resetResponse.data);

            // f7.dialog.alert(translate('change_password_success', language), () => {
            //     f7.views.main.router.navigate('/login/', {
            //         clearPreviousHistory: true,
            //     });
            // });
            // showToast(translate('change_password_success', language), theme)
            setSheetOpened(true)
        } catch (error) {
            console.error('Password reset failed:', error);
            // f7.dialog.alert(`${translate('change_password_failed', language)} ${error.response.data.message}`, "Error");
            showToastFailed(`${translate('change_password_failed', language)} ${error.response.data.message}`)
        } finally {
            setShowLoading(false);
        }
    };

    const handleVerificationComplete = () => {
        dispatch(updateOpenVerifPassword(false));
        dispatch(updateIsVerif(true));
    };

    useEffect(() => {
        dispatch(updateOpenVerifPassword(true));
    }, []);

    return (
        <Page>
            <Block style={{ margin: 0, paddingTop: "5px", height: "100%", background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", color: theme === "light" ? "black" : "white" }}>
                <BackButton label={translate('update_password_back_button', language)} />

                <form onSubmit={handleSubmit} style={{ marginTop: "30px", fontSize: "var(--font-sm)" }}>
                    <InputPassword
                        title={translate('update_password_current_password', language)}
                        id={"passwordOld"}
                        value={passwordOld}
                        isVisible={passwordOldVisible}
                        placeholder={translate('input_old_password', language)}
                        onChange={(e) => {
                            setPasswordOld(e.target.value);
                            setErrorMessage("");
                            setConfirmErrorMessage("");
                        }}
                        onClick={togglePasswordVisibility}
                        theme={theme}
                        error={errorMessage || confirmErrorMessage}
                    />

                    <InputPassword
                        title={translate('update_password_new_password', language)}
                        id={"passwordNew"}
                        value={passwordNew}
                        isVisible={passwordNewVisible}
                        placeholder={translate('input_new_password', language)}
                        onChange={(e) => {
                            setPasswordNew(e.target.value);
                            setErrorMessage("");
                            setConfirmErrorMessage("");
                        }}
                        onClick={togglePasswordNewVisibility}
                        theme={theme}
                        error={errorMessage || confirmErrorMessage}
                    />

                    <InputPassword
                        title={translate('update_password_confirm_new_password', language)}
                        id={"passwordConfirm"}
                        value={passwordConfirm}
                        isVisible={passwordConfirmVisible}
                        placeholder={translate('reinput_new_password', language)}
                        onChange={(e) => {
                            setPasswordConfirm(e.target.value);
                            setErrorMessage("");
                            setConfirmErrorMessage("");
                        }}
                        onClick={togglePasswordConfirmVisibility}
                        theme={theme}
                        error={errorMessage || confirmErrorMessage}
                    />

                    {errorMessage && <p style={{ color: "var(--color-red)" }}>{errorMessage}</p>}
                    {confirmErrorMessage && <p style={{ color: "var(--color-red)" }}>{confirmErrorMessage}</p>}
                </form>
            </Block>

            <ButtonFixBottom needBorderTop={false}>
                <CustomButton
                    handleClick={handleSubmit}
                    color={"white"}
                    bg={"var(--bg-primary-green)"}
                    disable={showLoading}
                    // disable
                    text={translate('update_password_update_password_button', language)}
                />
            </ButtonFixBottom>

            <LoadingPopup popupOpened={showLoading} setPopupOpened={setShowLoading} />
            <MessageAlertUpdatePassword
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={translate('change_password_success', language)}
                message={translate('change_password_success_text', language)}
                imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('back_to_login', language)}
            />
        </Page>
    );
};

export default UpdatePassword;