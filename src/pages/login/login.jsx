import React, { useEffect, useState } from 'react';
import { Page, Block } from 'framework7-react';
import '@mediapipe/face_detection/face_detection.js';
import Eclipse from "../../assets/bg-eclipse.svg";
import Logo from "../../assets/logo/logo-white.svg";
import InputForm from './components/inputForm';
import OTPInput from './components/otpInput';
import ForgotPassword from './components/forgotPassword';
import { API } from '../../api/axios';
import { SendOtp } from '../../functions/sendOtp';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../slices/settingsSlice';
import { selectLanguages } from '../../slices/languagesSlice';
import { translate } from '../../utils/translate';
import LoadingPopup from '../../components/loadingPopup';

const LoginPage = () => {
  const [emailNip, setEmailNip] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const theme = useSelector(selectSettings);
  const language = useSelector(selectLanguages);
  // const refreshToken = getRefreshToken();
  // console.log("refreshToken :", refreshToken);


  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  console.log('isOtpVisible:', isOtpVisible);


  // useEffect(() => {
  //   if (showLoading) {
  //     f7.dialog.preloader('Loading...');
  //   } else {
  //     f7.dialog.close();
  //   }
  // }, [showLoading]);

  // const checkRefreshToken = async () => {
  //   if (refreshToken) {
  //     try {
  //       const response = await axios.post(
  //         "https://oms-be.treffix.id/api/v1/mobile/auth/refresh-token",
  //         {},
  //         {
  //           headers: {
  //             Authorization: `Bearer ${refreshToken}`
  //           }
  //         }
  //       );

  //       const newToken = response.data.payload.access_token;
  //       const newRefreshToken = response.data.payload.refresh_token;

  //       localStorage.setItem('token', newToken);
  //       document.cookie = `refresh_token=${newRefreshToken}; path=/; secure; samesite=strict`;
  //     } catch (error) {
  //       console.error('Error refreshing token:', error);
  //       localStorage.removeItem('token');
  //       document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  //     }
  //   }
  // };

  // useEffect(() => {
  //   checkRefreshToken();
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setShowLoading(true);

    try {
      const response = await API.post('/mobile/auth/signin', {
        email: emailNip,
        password: password,
      });
      console.log('Login Success:', response.data);

      await SendOtp(emailNip, password, setErrorMessage);
      setIsOtpVisible(true);
    } catch (error) {
      console.error('Login Failed:', error.response.data.message);
      if (error.response.data.message == "Akun belum diaktivasi! Silahkan cek email anda") {
        setErrorMessage(translate('employee_not_found', language));
      } else if (error.response.data.message == "Karyawan tidak terdaftar") {
        setErrorMessage(translate('unregistered_email', language));
      } else if (error.response.data.message == "User tidak memiliki role") {
        setErrorMessage(translate('unroled_email', language));
      } else if (error.response.data.message == "Karyawan tidak aktif") {
        setErrorMessage(translate('inactived_email', language));
      } else {
        setErrorMessage(translate('login_wrong_email', language));
      }
    } finally {
      setShowLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  return (
    <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", color: theme === "light" ? "black" : "white" }}>
      <div>
        <div style={{ position: "fixed", zIndex: "-1", top: "-70px", left: "-70%", width: "100vw", height: "48%" }}>
          <img src={Eclipse} alt="bg" style={{ width: "250%", height: "100%" }} />
        </div>

        <Block style={{ width: "100%", height: "100vh", margin: "0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <img src={Logo} alt="logo" style={{ width: "80px", height: "80px" }} />
          <p style={{ fontWeight: 700, fontSize: "var(--font-lg)", color: "white" }}>{translate('login_welcome', language)}</p>

          {isForgotPassword ? (
            <ForgotPassword
              key="forgot"
              setEmail={setEmail}
              email={email}
              setIsForgotPassword={setIsForgotPassword}
              isForgotPassword={isForgotPassword}
            />
          ) : isOtpVisible ? (
            <OTPInput key="otp" emailNip={emailNip} password={password} setErrorMessage={setErrorMessage} setIsOtpVisible={setIsOtpVisible} />
          ) : (
            <InputForm
              key="input"
              emailNip={emailNip}
              setEmailNip={setEmailNip}
              password={password}
              setPassword={setPassword}
              passwordVisible={passwordVisible}
              togglePasswordVisibility={togglePasswordVisibility}
              handleSubmit={handleSubmit}
              handleForgotPasswordClick={handleForgotPasswordClick}
              errorMessage={errorMessage}
            />
          )}

          <p style={{ fontSize: "12px", color: "var(--color-dark-gray)", position: "absolute", bottom: "30px", fontWeight: "lighter", zIndex: "-1" }}>V 1.0.1</p>
        </Block>
      </div>

      <LoadingPopup popupOpened={showLoading} setPopupOpened={setShowLoading} />
    </Page>
  );
};

export default LoginPage;