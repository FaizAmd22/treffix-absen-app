import { Button, Popup, f7 } from 'framework7-react'
import { IoMdClose } from 'react-icons/io'
import { API } from '../../../api/axios'
import { translate } from '../../../utils/translate'
import { showToastFailed } from '../../../functions/toast'
import { useState } from 'react'
import CustomPopup from '../../../components/customPopup'
import ButtonFixBottomPopup from '../../../components/buttonFixBottomPopup'
import CustomButton from '../../../components/customButton'

const ExpiredPopup = ({ popupOpened, setPopupOpened, theme, title, language, testType, desc, btnYes, btnNo, method, setIsLoadingSubmit, setRatingOpened }) => {
  const token = localStorage.getItem("token")
  const sessionCode = localStorage.getItem("sessionCode")
  const [showPopup, setShowPopup] = useState(false)

  const handleCancel = () => {
    setPopupOpened(false)
  }

  const handleConfirm = async () => {
    const id = f7.views.main.router.currentRoute.params.id;
    setIsLoadingSubmit(true)
    try {
      let response = ""
      if (method == "online") {
        response = await API.post(`/user-developments/${id}/test-submit`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
      } else {
        response = await API.post(`/user-developments/${id}/offline/submit`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Session-Code': sessionCode,
          }
        });
      }
      console.log("response submit :", response);

      setIsLoadingSubmit(false)
      setPopupOpened(false)

      if (testType != 'post_test') {
        f7.views.main.router.navigate(`/video-learning/${id}/`, {
          reloadCurrent: false,
          replaceState: true,
          clearPreviousHistory: true,
        });
      } else {
        if (response.data.payload.finished == true) {
          setPopupOpened(false);
          setRatingOpened(true)
        } else {
          setPopupOpened(false);
          setShowPopup(true)
          // f7.dialog.create({
          //   title: translate('training_failed', language),
          //   text: translate('question_rewatch_video', language),
          //   buttons: [
          //     {
          //       text: 'OK',
          //       onClick: function () {
          //         f7.views.main.router.navigate(`/video-learning/${id}/`, {
          //           reloadCurrent: false,
          //           replaceState: true,
          //           clearPreviousHistory: true,
          //         });
          //       }
          //     }
          //   ],
          //   destroyOnClose: true
          // }).open();
        }
      }
    } catch (error) {
      setIsLoadingSubmit(false)
      setPopupOpened(false)
      // f7.dialog.alert(translate('question_submit_failed', language))
      showToastFailed(translate('question_submit_failed', language))
    }
  }

  const handleConfirmPopup = () => {
    const id = f7.views.main.router.currentRoute.params.id;
    f7.views.main.router.navigate(`/video-learning/${id}/`, { clearPreviousHistory: true, })
  }

  return (
    <Popup
      opened={popupOpened}
      onPopupClose={() => setPopupOpened(false)}
      style={{ width: "90%", height: "40%", borderRadius: "12px", position: "absolute", top: 250, left: 20, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
    >
      <div style={{ height: '80%', display: "flex", flexDirection: "column", justifyContent: "space-between", padding: '20px', textAlign: "center", color: theme === "light" ? "black" : "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--font-lg)", fontWeight: 700, marginTop: "-10px" }}>
          <p>{title}</p>

          <Button style={{ border: "none", color: theme === "light" ? "black" : "white", padding: 0, margin: 0 }} onClick={() => setPopupOpened(false)}>
            <IoMdClose size={"20px"} />
          </Button>
        </div>

        <p style={{ color: theme === "light" ? "#727272" : "var(--bg-primary-white)", fontSize: "var(--font-sm)" }}>{desc}</p>

        <ButtonFixBottomPopup>
          <CustomButton
            color={"var(--bg-primary-green)"}
            bg={"transparent"}
            border={"1px solid var(--bg-primary-green)"}
            text={btnNo}
            handleClick={handleCancel}
          />

          <CustomButton
            color={"white"}
            bg={"var(--bg-primary-green)"}
            border={"1px solid var(--bg-primary-green)"}
            text={btnYes}
            handleClick={handleConfirm}
          />
        </ButtonFixBottomPopup>
      </div>

      <CustomPopup
        title={translate('training_failed', language)}
        message={translate('question_rewatch_video', language)}
        popupOpened={showPopup}
        setPopupOpened={setShowPopup}
        btnYes={"OK"}
        handleConfirm={handleConfirmPopup}
      />
    </Popup>
  )
}

export default ExpiredPopup