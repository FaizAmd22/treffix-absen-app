import { Button } from 'framework7-react'
import React, { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { translate } from '../../../utils/translate'

const InputOtpForgetPassword = ({
    handleVerifyOtp,
    countdown,
    otp,
    otpError,
    handleChange,
    isLoading,
    onResend,
}) => {
    const numberOfDigits = 4;
    const otpBoxReference = useRef([]);
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    useEffect(() => {
        otpBoxReference.current[0]?.focus();
    }, []);

    const otpArray = otp.split('').concat(Array(numberOfDigits - otp.length).fill(''));

    const handleInputChange = (value, index) => {
        if (/^\d*$/.test(value) && value.length <= 1) {
            const newOtpArray = [...otpArray];
            newOtpArray[index] = value;
            const newOtp = newOtpArray.join('').replace(/undefined/g, '');

            const syntheticEvent = { target: { value: newOtp } };
            handleChange(syntheticEvent);

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

    useEffect(() => {
        otpArray.forEach((digit, index) => {
            if (otpBoxReference.current[index]) {
                otpBoxReference.current[index].style.border = digit
                    ? "1px solid var(--color-success-green, #4CAF50)"
                    : "1px solid var(--border-primary-gray)";
            }
        });
    }, [otp]);

    useEffect(() => {
        if (!otpError) return;
        otpBoxReference.current.forEach((el) => {
            if (el) el.style.border = "1px solid var(--color-red)";
        });
    }, [otpError]);

    const resendDisabled = countdown !== 0;

    return (
        <div style={{ color: theme === "light" ? "black" : "white", paddingBottom: "10px" }}>
            <p style={{ fontSize: "16px", fontWeight: 700, textAlign: "center" }}>
                {translate('forgot_password_title', language)}
            </p>

            <p style={{ textAlign: "center", marginBottom: "30px" }}>
                {translate('input_otp_forgot_enter_code_label', language)}
                <span style={{ fontWeight: "700", color: "var(--bg-primary-green)" }}>{countdown} </span>
                {translate('seconds', language)}
            </p>

            <form onSubmit={handleVerifyOtp}>
                <label style={{ fontWeight: "600", display: "block", marginBottom: "10px" }}>
                    {translate('otp_code', language)}
                </label>

                <div style={{ display: "flex", justifyContent: "space-between", margin: "20px 0 12px 0", fontSize: "18px" }}>
                    {otpArray.map((digit, index) => (
                        <input
                            key={index}
                            value={digit || ''}
                            maxLength={1}
                            type='number'
                            onChange={(e) => handleInputChange(e.target.value, index)}
                            onKeyUp={(e) => handleBackspaceAndEnter(e, index)}
                            ref={(reference) => (otpBoxReference.current[index] = reference)}
                            onFocus={(e) => e.target.style.border = "1px solid var(--bg-primary-green)"}
                            onBlur={(e) => {
                                if (!otpArray[index]) {
                                    e.target.style.border = "1px solid var(--border-primary-gray)";
                                }
                            }}
                            aria-invalid={otpError ? "true" : "false"}
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

                <p style={{
                    color: "var(--color-red)",
                    minHeight: "20px",
                    textAlign: "center",
                    marginTop: "15px",
                    marginBottom: "10px",
                    fontSize: "12px",
                    fontWeight: 600
                }}>
                    {otpError || ""}
                </p>

                <Button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        backgroundColor: isLoading ? "#ccc" : "var(--bg-primary-green)",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "700",
                        padding: "16px 0px",
                        textTransform: "capitalize",
                        borderRadius: "8px"
                    }}
                >
                    {isLoading ? "Loading ..." : translate('done', language)}
                </Button>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)",
                        fontSize: "14px",
                        marginTop: "12px"
                    }}
                >
                    <p>{translate('otp_input_dont_recive_otp', language)}</p>
                    <Button
                        style={{
                            fontSize: "14px",
                            fontWeight: !resendDisabled ? "700" : "normal",
                            cursor: !resendDisabled ? "pointer" : "not-allowed",
                            color: !resendDisabled
                                ? "var(--bg-primary-green)"
                                : (theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)"),
                            background: "none",
                            border: "none",
                            padding: 0,
                            marginLeft: "3px",
                            textTransform: "capitalize"
                        }}
                        onClick={onResend}
                        disabled={resendDisabled}
                    >
                        {translate('send_back', language)}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default InputOtpForgetPassword
