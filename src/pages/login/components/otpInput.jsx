import React, { useRef, useState, useEffect } from 'react';
import { Button, f7, Link } from 'framework7-react';
import { SendOtp } from '../../../functions/sendOtp';
import { API } from '../../../api/axios';
import { BiometricAuth } from '../../../functions/biometricAuth';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import LoadingPopup from '../../../components/loadingPopup';
import SaveBioMetricPopup from './saveBiometricPopup';

const OTPInput = ({ emailNip, password, setErrorMessage, setIsOtpVisible }) => {
    const numberOfDigits = 4;
    const [otp, setOtp] = useState(new Array(numberOfDigits).fill(""));
    const [otpError, setOtpError] = useState(null);
    const [countdown, setCountdown] = useState(60);
    const [showLoading, setShowLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [showSaveBiometric, setShowSaveBiometric] = useState(false);
    const otpBoxReference = useRef([]);
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    useEffect(() => {
        otpBoxReference.current[0]?.focus();

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleChange = (value, index) => {
        if (/^\d*$/.test(value) && value.length <= 1) {
            let newArr = [...otp];
            newArr[index] = value;
            setOtp(newArr);

            if (otpBoxReference.current[index]) {
                otpBoxReference.current[index].style.border = value
                    ? "1px solid var(--color-success-green, #4CAF50)"
                    : "1px solid var(--border-primary-gray)";
            }

            if (value && index < numberOfDigits - 1) {
                otpBoxReference.current[index + 1].focus();
            }
        }
    };

    const handleBackspaceAndEnter = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
            otpBoxReference.current[index - 1].focus();

            if (otpBoxReference.current[index]) {
                otpBoxReference.current[index].style.border = "1px solid var(--border-primary-gray)";
            }
        }
    };

    console.log("otpError :", otpError);

    const checkNotificationPermission = () => {
        cordova.plugins.WonderPush.getNotificationEnabled(function (enabled) {
            console.log("Notification permission enabled:", enabled);
            setIsSubscribe(enabled);
        });
    }

    function debugWonderPush() {
        if (cordova && cordova.plugins && cordova.plugins.WonderPush) {
            cordova.plugins.WonderPush.getInstallationId(
                function (installationId) {
                    console.log("Installation ID:", installationId);
                },
                function (error) {
                    console.error("Get installation ID failed:", error);
                }
            );

            cordova.plugins.WonderPush.getUserId(
                function (userId) {
                    console.log("Current User ID:", userId);
                },
                function (error) {
                    console.error("Get user ID failed:", error);
                }
            );

            cordova.plugins.WonderPush.getPushToken(
                function (token) {
                    console.log("Push Token:", token);
                },
                function (error) {
                    console.error("Get push token failed:", error);
                }
            );
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join("");
        setShowLoading(true);
        setOtpError(null);

        try {
            const responseSendOTP = await API.post('/mobile/auth/verify-otp', {
                email: emailNip,
                password: password,
                code: otpValue,
            });
            const tokens = responseSendOTP.data.payload.access_token;
            const refresh_token = responseSendOTP.data.payload.refresh_token;
            const isReminderAttendance = localStorage.getItem("reminderAttendance")
            localStorage.setItem('token', tokens);
            setToken(tokens)
            document.cookie = `refresh_token=${refresh_token}; path=/; secure; samesite=strict`;
            console.log("otp error :", otpError);
            if (!isReminderAttendance) {
                localStorage.setItem("reminderAttendance", "true")
            }
            // localStorage.setItem("isOnboarding", true)


            setShowSaveBiometric(true)
            if (cordova && cordova.plugins && cordova.plugins.WonderPush) {
                // window.cordova.plugins.WonderPush.subscribeToNotifications();
                // WonderPush.setUserId(emailNip, function () {
                //     console.log("Success");
                // });
                cordova.plugins.WonderPush.setUserId(emailNip, function () {
                    console.log("User ID set:", emailNip);
                }, function (err) {
                    console.error("Set user ID failed:", err);
                });

                checkNotificationPermission()
                debugWonderPush()
            } else {
                console.warn("WonderPush plugin not available");
            }
        } catch (error) {
            console.error('Login Failed:', error);
            setOtpError(translate('otp_input_wrong_otp', language),);
        } finally {
            setShowLoading(false);
        }
    };

    const handleResend = async () => {
        setCountdown(60);
        setOtp(new Array(numberOfDigits).fill(""));
        setOtpError(null);

        otpBoxReference.current.forEach(input => {
            if (input) {
                input.style.border = "1px solid var(--border-primary-gray)";
            }
        });

        await SendOtp(emailNip, password, setErrorMessage);
    };

    useEffect(() => {
        otp.forEach((digit, index) => {
            if (otpBoxReference.current[index]) {
                otpBoxReference.current[index].style.border = digit
                    ? "1px solid var(--color-success-green, #4CAF50)"
                    : "1px solid var(--border-primary-gray)";
            }
        });
    }, [otp]);

    return (
        <div style={{ width: "95%", background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)", color: theme === "light" ? "black" : "white", boxShadow: "0px 0px 3px rgba(0, 0, 2, 0.15)", borderRadius: "14px", padding: "20px 12px", fontSize: "14px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, textAlign: "center" }}>{translate('otp_code', language)}</p>

            <p style={{ textAlign: "center" }}>
                {translate('otp_input_enter_otp_label', language)}
                <span style={{ fontWeight: "700", color: "var(--bg-primary-green)" }}>{countdown} </span>
                {translate('seconds', language)}
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "40px 0 0 0", fontSize: "18px" }}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            value={digit}
                            maxLength={1}
                            type='number'
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyUp={(e) => handleBackspaceAndEnter(e, index)}
                            ref={(reference) => (otpBoxReference.current[index] = reference)}
                            onFocus={(e) => e.target.style.border = "1px solid var(--bg-primary-green)"}
                            onBlur={(e) => {
                                if (!otp[index]) {
                                    e.target.style.border = "1px solid var(--border-primary-gray)";
                                }
                            }}
                            style={{
                                width: "40px",
                                height: "50px",
                                borderRadius: "5px",
                                textAlign: "center",
                                fontSize: "18px",
                                border: "1px solid var(--border-primary-gray)",
                                background: "none",
                                boxShadow: "none"
                            }}
                        />
                    ))}
                </div>

                <p style={{ color: "var(--color-red)", height: "30px", textAlign: "center", marginTop: "20px", marginBottom: 0 }}>{otpError && otpError}</p>

                <Button type="submit" style={{ width: "100%", backgroundColor: "var(--bg-primary-green)", color: "white", fontSize: "14px", fontWeight: "700", padding: "20px 0px", textTransform: "capitalize", borderRadius: "8px" }}>
                    {translate('login', language)}
                </Button>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", fontSize: "14px", marginTop: "15px" }}>
                    <p>{translate('otp_input_dont_recive_otp', language)}</p>

                    <Button
                        style={{ fontSize: "14px", fontWeight: countdown !== 0 ? "normal" : "700", cursor: countdown === 0 ? "pointer" : "not-allowed", color: countdown === 0 ? "var(--bg-primary-green)" : (theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)"), background: "none", border: "none", padding: 0, marginLeft: "3px", textTransform: "capitalize" }}
                        onClick={handleResend}
                        disabled={countdown !== 0}
                    >
                        {translate('send_back', language)}
                    </Button>
                </div>
            </form>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
                <Link onClick={() => setIsOtpVisible(false)} style={{ fontWeight: "bold", fontSize: "14px", color: "var(--bg-primary-green)" }}>{translate('back', language)}</Link>
            </div>

            <LoadingPopup popupOpened={showLoading} setPopupOpened={setShowLoading} />
            <SaveBioMetricPopup popupOpened={showSaveBiometric} setPopupOpened={setShowSaveBiometric} token={token} />
        </div>
    );
};

export default OTPInput;