import React, { useEffect, useRef, useState } from 'react';
import InputForgotPassword from './inputForgotPassword';
import ResetPassword from './resetPassword';
import InputOtpForgetPassword from './inputOtpForgetPassword';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { APIFaceRecog } from '../../../api/axios';
import { showToastFailed } from '../../../functions/toast';
import { Link } from 'framework7-react';


const ForgotPassword = ({ setEmail, email, isForgotPassword, setIsForgotPassword }) => {
    const [isOtpVisible, setIsOtpVisible] = useState(false);
    const [isResetVisible, setIsResetVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState(null);
    const [emailForOtp, setEmailForOtp] = useState("");
    const otpInputRef = useRef(null);
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    const [countdown, setCountdown] = useState(60);
    const timerRef = useRef(null)

    useEffect(() => {
        if (isOtpVisible && countdown > 0 && !timerRef.current) {
            timerRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        if (!isOtpVisible) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setCountdown(60);
            setOtpError(null);
            setOtp("");
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isOtpVisible, countdown]);

    const handleChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 4) {
            setOtp(value);
            if (otpError) setOtpError(null);
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        try {
            const response = await APIFaceRecog.post('/auth/forgot-password/send-otp', { value: email, method: "email" })
            console.log("response send otp :", response);

            setEmailForOtp(email);
            setIsOtpVisible(true);
            setEmail("")
        } catch (error) {
            showToastFailed("Email Tidak Terdaftar. Periksa Email Anda Kembali")
        } finally {
            setIsLoading(false)
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        try {
            const response = await APIFaceRecog.post('/auth/forgot-password/verify-otp', { otp_code: otp })
            console.log("response verify otp :", response);

            setOtpError(null);
            setIsOtpVisible(false)
            setIsResetVisible(true)
            localStorage.setItem("otp", otp)
            console.log("otp code :", otp);
        } catch (error) {
            setOtpError("Kode OTP tidak valid!");
        } finally {
            setIsLoading(false)
        }
    };

    console.log("countdown :", countdown);

    const handleResendOtp = async () => {
        if (countdown !== 0) return;
        setIsLoading(true);
        try {
            await APIFaceRecog.post('/auth/forgot-password/send-otp', { value: emailForOtp, method: "email" });
            setOtp("");
            setOtpError(null);
            setCountdown(60);
        } catch (err) {
            setOtpError("Gagal mengirim ulang OTP. Coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ width: "95%", background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)", color: theme === "light" ? "black" : "white", boxShadow: "0px 0px 3px rgba(0, 0, 2, 0.15)", borderRadius: "12px", padding: "20px 12px", fontSize: "12px" }}>
            {
                isOtpVisible ? (
                    <InputOtpForgetPassword handleVerifyOtp={handleVerifyOtp} countdown={countdown} otp={otp} otpError={otpError} otpInputRef={otpInputRef} handleChange={handleChange} isLoading={isLoading} onResend={handleResendOtp} />
                ) : isResetVisible ? (
                    <ResetPassword />
                ) : (
                    <InputForgotPassword handleSendOtp={handleEmailSubmit} email={email} setEmail={setEmail} isLoading={isLoading} />
                )
            }

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
                <Link onClick={() => setIsForgotPassword(!isForgotPassword)} style={{ fontWeight: "bold", fontSize: "14px", marginTop: "-10px", color: "var(--bg-primary-green)" }}>{translate('forgot_password_back_in', language)}</Link>
            </div>
        </div>
    )
}

export default ForgotPassword