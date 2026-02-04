import React, { useRef, useState, useEffect } from 'react';
import Verif from "../../../assets/icons/verifications.svg";
import { Block, Button, Page, f7 } from 'framework7-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateOpenVerifEmail } from '../../../slices/verficationSlice';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { selectUser } from '../../../slices/userSlice';
import { API } from '../../../api/axios';
import { updateOtp } from '../../../slices/otpSlice';
import BackButton from '../../../components/backButton';

const Verifications = ({ title, onVerificationComplete }) => {
    const numberOfDigits = 4;
    const [verifCode, setVerifCode] = useState(new Array(numberOfDigits).fill(""));
    const [otpError, setOtpError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const verifCodeReference = useRef([]);
    const dispatch = useDispatch();
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const user = useSelector(selectUser)

    useEffect(() => {
        verifCodeReference.current[0]?.focus();
    }, []);

    // useEffect(() => {
    //     if (isLoading) {
    //         f7.dialog.preloader('Loading...');
    //     } else {
    //         f7.dialog.close();
    //     }
    // }, [isLoading]);

    const fetchSubmit = async (otpValue) => {
        try {
            const responseSendOTP = await API.post('/auth/forgot-password/verify-otp', {
                otp_code: otpValue,
            });
            setOtpError(null);
            console.log("responseSendOTP :", responseSendOTP);
            dispatch(updateOtp(otpValue));
            onVerificationComplete()
        } catch (error) {
            console.error('Login Failed:', error);
            setOtpError(translate('otp_input_wrong_otp', language));
        } finally {
            setIsLoading(false);
        }
    }

    const handleSubmit = () => {
        if (verifCode.every(digit => digit !== "")) {
            const otpValue = verifCode.join("");
            console.log("otpValue :", otpValue);
            setIsLoading(true);
            fetchSubmit(otpValue);
            dispatch(updateOtp(otpValue))
            setIsLoading(false);
        }
    };

    const handleChange = (value, index) => {
        if (/^\d*$/.test(value) && value.length <= 1) {
            let newArr = [...verifCode];
            newArr[index] = value;
            setVerifCode(newArr);
            setOtpError(null);

            if (value && index < numberOfDigits - 1) {
                verifCodeReference.current[index + 1].focus();
            }
        }
    };

    const handleBackspaceAndEnter = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
            verifCodeReference.current[index - 1].focus();
        }
    };

    const SendOtp = async () => {
        try {
            const responseSendOTP = await API.post('/auth/forgot-password/send-otp', {
                method: "email",
                value: user.email,
            });
            console.log('OTP Sended:', responseSendOTP.data);
        } catch (error) {
            console.error('Failed to send OTP:', error);
            setErrorMessage(translate('send_otp_failed', language));
        }
    };

    const handleResend = async () => {
        setVerifCode(new Array(numberOfDigits).fill(""));
        setOtpError(null);
        await SendOtp();
    };

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "10px 0px", marginBottom: "20px", color: theme == "light" ? "black" : "white" }}>
                <div style={{ padding: "0 18px" }}>
                    {title == "Ubah Kata Sandi" || "Change Password" ? (
                        <BackButton label={title} />
                    ) : (
                        <Button onClick={() => dispatch(updateOpenVerifEmail(false))} style={{ color: theme === "light" ? "black" : "white", width: "160px", height: "55px", textTransform: "capitalize", marginLeft: "-10px" }}>
                            <IoIosArrowRoundBack size={"25px"} style={{ marginRight: "10px" }} />
                            <p style={{ fontSize: "var(--font-lg)", fontWeight: "600" }}>{title}</p>
                        </Button>
                    )}
                </div>

                <div style={{ textAlign: "center", marginTop: "30px" }}>
                    <img src={Verif} alt="Verif" style={{ width: "40px", height: "40px" }} />
                    <p style={{ fontSize: "var(--font-md)", fontWeight: "700" }}>{translate('verification_input_code_verif', language)}</p>
                    <p style={{ fontSize: "var(--font-sm)", marginBottom: "-12px" }}>{translate('verification_code_verif_has_been_sended', language)}</p>
                    <p style={{ fontSize: "var(--font-sm)" }}>{user.email}</p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", margin: "40px 10%", gap: "10px" }}>
                    {verifCode.map((digit, index) => (
                        <input
                            key={index}
                            value={digit}
                            maxLength={1}
                            type='number'
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyUp={(e) => handleBackspaceAndEnter(e, index)}
                            ref={(reference) => (verifCodeReference.current[index] = reference)}
                            onFocus={(e) => e.target.style.border = "1px solid var(--bg-primary-green)"}
                            onBlur={(e) => e.target.style.border = "1px solid var(--border-primary-gray)"}
                            style={{
                                width: "40px",
                                height: "50px",
                                borderRadius: "5px",
                                textAlign: "center",
                                fontSize: "var(--font-lg)",
                                border: "1px solid var(--border-primary-gray)",
                                background: "none",
                                boxShadow: "none"
                            }}
                        />
                    ))}
                </div>

                <p style={{
                    color: "var(--color-red)",
                    height: "30px",
                    textAlign: "center",
                    marginBottom: "20px"
                }}>
                    {verifCode.every(digit => digit !== "") && otpError}
                </p>

                <div style={{ padding: "0 10%", marginBottom: "20px" }}>
                    <Button
                        onClick={handleSubmit}
                        style={{
                            width: "100%",
                            backgroundColor: "var(--bg-primary-green)",
                            color: "white",
                            fontSize: "var(--font-sm)",
                            fontWeight: "700",
                            padding: "20px 0px",
                            textTransform: "capitalize",
                            borderRadius: "8px"
                        }}
                    >
                        Submit
                    </Button>
                </div>

                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "var(--font-sm)" }}>
                    <p>{translate('verification_didnt_receive_code', language)}</p>
                    <Button onClick={handleResend} style={{ textTransform: "capitalize", fontSize: "var(--font-sm)", marginLeft: "-3px" }}>{translate('send_back', language)}</Button>
                </div>
            </div>

            <LoadingPopup popupOpened={isLoading} setPopupOpened={setIsLoading} />
        </Page>
    );
};

export default Verifications;