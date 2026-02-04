import { API } from '../api/axios';

export const SendOtp = async (email, password, setErrorMessage) => {
    try {
        const responseSendOTP = await API.post('/mobile/auth/send-otp', {
            type: "email",
            email: email,
            password: password,
        });
        console.log('OTP Sended:', responseSendOTP.data);
    } catch (error) {
        console.error('Failed to send OTP:', error);
        setErrorMessage('OTP tidak terkirim. Silahkan coba lagi');
    }
};