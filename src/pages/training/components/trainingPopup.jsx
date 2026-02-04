import { Button, Popup, f7 } from 'framework7-react'
import React from 'react'
import { IoMdClose } from 'react-icons/io'
import ButtonFixBottomPopup from '../../../components/buttonFixBottomPopup'
import CustomButton from '../../../components/customButton'

const TrainingPopup = ({ popupOpened, setPopupOpened, theme, handleConfirm, title, desc, btnYes, btnNo, needBack }) => {
  const handleCancel = () => {
    setPopupOpened(false)
    if (needBack) {
      f7.views.main.router.back()
    }
  }

  return (
    <Popup
      opened={popupOpened}
      onPopupClose={() => setPopupOpened(false)}
      style={{ width: "90%", height: "auto", borderRadius: "12px", position: "absolute", top: 250, left: 20, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
    >
      <div style={{ height: '80%', display: "flex", flexDirection: "column", justifyContent: "space-between", padding: '20px', textAlign: "center", color: theme === "light" ? "black" : "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--font-lg)", fontWeight: 700, marginTop: "-10px" }}>
          <p>{title}</p>

          <Button style={{ border: "none", color: theme === "light" ? "black" : "white", padding: 0, margin: 0 }} onClick={() => setPopupOpened(false)}>
            <IoMdClose size={"20px"} />
          </Button>
        </div>

        <p style={{ color: theme === "light" ? "#727272" : "var(--bg-primary-white)", fontSize: "var(--font-sm)", padding: "10px 0" }}>{desc}</p>

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
    </Popup>
  )
}

export default TrainingPopup