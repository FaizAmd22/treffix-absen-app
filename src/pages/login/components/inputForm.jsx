import { useEffect, useState } from 'react';
import { Button, f7 } from 'framework7-react';
import { LuFingerprint } from "react-icons/lu";
import { BiometricAuth } from '../../../functions/biometricAuth';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { showToastFailed } from '../../../functions/toast';
import InputText from '../../../components/inputText';
import InputPassword from '../../../components/inputPassword';
import { API } from '../../../api/axios';
import Loading from '../../../components/loading';
import { z } from "zod";

const InputForm = ({ emailNip, setEmailNip, password, setPassword, passwordVisible, togglePasswordVisibility, handleSubmit, handleForgotPasswordClick, errorMessage }) => {
  const theme = useSelector(selectSettings)
  const language = useSelector(selectLanguages)
  const [lastBackPress, setLastBackPress] = useState(0);
  const [biometricTokenAvailable, setBiometricTokenAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({ emailNip: "", password: "" });

  useEffect(() => {
    const checkBiometricToken = async () => {
      const isBiometric = localStorage.getItem("isBiometric")
      if (isBiometric == "true") {
        setBiometricTokenAvailable(true)
      } else {
        setBiometricTokenAvailable(false)
      }
    };

    checkBiometricToken();
  }, []);

  useEffect(() => {
    const handleBackButton = () => {
      const now = Date.now();
      if (now - lastBackPress < 2000) {
        navigator.app.exitApp();
      } else {
        f7.toast.show({ text: translate('press_again_to_exit', language), closeTimeout: 1500 });
        setLastBackPress(now);
      }
    };

    document.addEventListener('backbutton', handleBackButton);

    return () => document.removeEventListener('backbutton', handleBackButton);
  }, [lastBackPress, language]);

  const fetchData = async () => {
    setIsLoading(true)
    // try {
    const getSteps = await API.get("/mobile/employees/onboarding/steps");
    const completedSteps = getSteps.data.payload?.completed_steps || [];

    setTimeout(() => {
      if (completedSteps.length === 0) {
        f7.views.main.router.navigate("/register-face/", { clearPreviousHistory: true });
      } else if (completedSteps.includes("face_register") && !completedSteps.includes("jobdesc")) {
        f7.views.main.router.navigate("/jobdesc/", { clearPreviousHistory: true });
      } else if (completedSteps.includes("jobdesc") && !completedSteps.includes("upload_document")) {
        f7.views.main.router.navigate("/upload-dokumen/", { clearPreviousHistory: true });
      } else if (completedSteps.includes("upload_document") && !completedSteps.includes("employe_data")) {
        f7.views.main.router.navigate("/employe-data/", { clearPreviousHistory: true });
      } else if (completedSteps.includes("employe_data")) {
        f7.views.main.router.navigate("/home/", { clearPreviousHistory: true });
      } else {
        f7.views.main.router.navigate("/register-face/", { clearPreviousHistory: true });
      }
    }, 500);

    // } catch (error) {
    //   console.error("Error fetching user:", error);
    // } finally {
    setIsLoading(false)
    // }
  };

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ emailNip, password });
    if (!result.success) {
      const fieldErrors = { emailNip: "", password: "" };
      result.error.issues.forEach((iss) => {
        if (iss.path[0] === "emailNip") fieldErrors.emailNip = iss.message;
        if (iss.path[0] === "password") fieldErrors.password = iss.message;
      });
      setFormErrors(fieldErrors);
      return;
    }
    setFormErrors({ emailNip: "", password: "" });
    if (typeof handleSubmit === "function") handleSubmit(e);
  };

  const handleBiometricLogin = async () => {
    try {
      const isBiometricAvailable = await BiometricAuth.isAvailable();

      if (!isBiometricAvailable) {
        showToastFailed(translate('alert_biometric_not_available', language))
        return;
      }

      const token = await BiometricAuth.getToken();
      localStorage.setItem('token', token);
      console.log("token biometric :", token);
      const tokenLocal = localStorage.getItem("token")
      console.log("token localstorage :", tokenLocal);


      if (!token) {
        // f7.dialog.alert(translate('alert_biometric_not_saved', language));
        showToastFailed(translate('alert_biometric_not_saved', language))
        return;
      }

      fetchData();
    } catch (error) {
      console.error('Biometric login failed:', error);
      // f7.dialog.alert(translate('alert_biometric_login_failed', language));
      showToastFailed(translate('alert_biometric_login_failed', language))
    }
  };

  if (isLoading) {
    return <Loading height={"100%"} />
  }

  const loginSchema = z.object({
    emailNip: z.string().trim().min(1, translate('field_cant_empty', language)),
    password: z.string().trim().min(1, translate('field_cant_empty', language)),
  });

  return (
    <div style={{ width: "95%", background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)", color: theme === "light" ? "black" : "white", boxShadow: "0px 0px 3px rgba(0, 0, 2, 0.15)", borderRadius: "12px", padding: "15px 12px 0px 12px", fontSize: "14px" }}>
      <p style={{ fontSize: "18px", fontWeight: 700, textAlign: "center" }}>{translate('login', language)}</p>

      <div>
        <form onSubmit={handleLocalSubmit}>
          <InputText
            type={"text"}
            id={"emailNip"}
            value={emailNip}
            onChange={(e) => setEmailNip(e.target.value)}
            title={"NIP/Email Karyawan"}
            placeholder={translate('input_email_text', language)}
            theme={theme}
            error={!!formErrors.emailNip}
            errorMessage={formErrors.emailNip}
            needLowerCase
          />

          <InputPassword
            title={"Password"}
            id={"password"}
            value={password}
            isVisible={passwordVisible}
            placeholder={translate('input_password_text', language)}
            onChange={(e) => setPassword(e.target.value)}
            onClick={togglePasswordVisibility}
            theme={theme}
            error={!!formErrors.password}
            errorMessage={formErrors.password}
          />

          <div style={{ display: "flex", justifyContent: "end", alignItems: "center", margin: "10px 0px 25px 0px" }}>
            <a
              style={{ color: "var(--bg-primary-green)", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
              onClick={handleForgotPasswordClick}
            >
              {translate('login_forgot_password', language)}
            </a>
          </div>

          {errorMessage && (
            <p style={{ color: 'red', fontWeight: 'bold', margin: 0 }}>{errorMessage}</p>
          )}

          <Button type="submit" style={{ width: "100%", backgroundColor: "var(--bg-primary-green)", color: "white", fontSize: "14px", fontWeight: "700", padding: "25px 0px", textTransform: "capitalize", borderRadius: "8px", marginTop: "10px", marginBottom: "30px", }}>
            <p>{translate('login', language)}</p>
          </Button>
        </form>

        {biometricTokenAvailable && (
          <div style={{ width: "100%", height: "100%", paddingBottom: "20px", display: "flex", justifyContent: "center", alignItems: "center", }}>
            <div
              onClick={handleBiometricLogin}
              style={{ display: "flex", flexDirection: "column", color: "var(--bg-primary-green)", textTransform: "capitalize", width: "50%", justifyContent: "center", alignItems: "center", border: "none", background: "none" }}
            >
              <LuFingerprint size={"38px"} />
              <p style={{ fontWeight: "700", fontSize: "var(--font-xs)", padding: 0, margin: 0, marginTop: "5px" }}>Biometric Login</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputForm;