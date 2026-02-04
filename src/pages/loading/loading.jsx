import { f7, Page } from "framework7-react";
import React, { useEffect, useState } from "react";
import Loading from "../../components/loading";
import { useSelector } from "react-redux";
import { selectSettings } from "../../slices/settingsSlice";
import { API } from "../../api/axios";
import MessageAlert from "../../components/messageAlert";
import { selectLanguages } from "../../slices/languagesSlice";
import { translate } from "../../utils/translate";
import ImageAlertLight from '../../assets/messageAlert/register-light.png'
import ImageAlertDark from '../../assets/messageAlert/register-dark.png'

const LoadingPage = () => {
  const theme = useSelector(selectSettings);
  const language = useSelector(selectLanguages)
  const [sheetOpened, setSheetOpened] = useState(false);

  const fetchData = async () => {
    try {
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
      }, 300);

    } catch (error) {
      console.error("Error fetching user:", error);

      setTimeout(() => {
        console.log("Error occurred, navigating to home");
        f7.views.main.router.navigate("/home/", {
          reloadCurrent: false,
          replaceState: true,
          clearPreviousHistory: true,
          props: {
            targetTab: "view-home",
          },
        });
      }, 100);
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Page
      style={{
        height: "100vh",
        background:
          theme === "light"
            ? "var(--bg-primary-white)"
            : "var(--bg-secondary-black)",
      }}
    >
      <div style={{ height: "100dvh" }}>
        <Loading height="100%" />

        <MessageAlert
          sheetOpened={sheetOpened}
          setSheetOpened={setSheetOpened}
          title={translate('register_face', language)}
          message={translate('register_face_text', language)}
          imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
          btnCloseText={translate('start_activation', language)}
          handleClick={() => f7.views.main.router.navigate("/capture-face/register/")}
        />
      </div>
    </Page>
  );
};

export default LoadingPage;