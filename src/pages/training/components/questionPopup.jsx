import { Button, Popup } from 'framework7-react'
import React from 'react'
import { IoMdClose } from 'react-icons/io'
import { translate } from '../../../utils/translate'
import ButtonFixBottomPopup from '../../../components/buttonFixBottomPopup'
import CustomButton from '../../../components/customButton'

const QuestionPopup = ({ popupOpened, setPopupOpened, theme, nextTest, handleConfirm, isAllAnswered, language }) => {
    return (
        <Popup
            opened={popupOpened}
            onPopupClose={() => setPopupOpened(false)}
            style={{ width: "90%", height: "50%", borderRadius: "12px", position: "absolute", top: 250, left: 20, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
        >
            <div style={{ height: "88%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px", textAlign: "center", fontSize: "var(--font-sm)", color: theme === "light" ? "black" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--font-lg)", fontWeight: 700, marginTop: "-10px" }}>
                    <p>{!isAllAnswered ? translate('question_unanswered', language) : (nextTest == "video_learning" ? translate('question_next_to_video', language) : translate('question_finished', language))}</p>

                    <Button style={{ border: "none", color: theme === "light" ? "black" : "white", padding: 0, margin: 0 }} onClick={() => setPopupOpened(false)}>
                        <IoMdClose size={"20px"} />
                    </Button>
                </div>

                {
                    !isAllAnswered ? (
                        <p style={{ color: theme === "light" ? "var(--color-dark-gray)" : "var(--bg-primary-white)" }}>
                            {translate('question_unanswered_popup', language)}
                        </p>
                    ) : (
                        nextTest == "video_learning" ? (
                            <p style={{ color: theme === "light" ? "var(--color-dark-gray)" : "var(--bg-primary-white)" }}>
                                {translate('question_next_to_video_popup', language)}
                            </p>
                        ) : (
                            <p style={{ color: theme === "light" ? "var(--color-dark-gray)" : "var(--bg-primary-white)" }}>
                                {translate('question_finished_popup', language)}
                            </p>
                        )
                    )
                }

                <ButtonFixBottomPopup>
                    <CustomButton
                        color={"var(--bg-primary-green)"}
                        bg={"transparent"}
                        border={"1px solid var(--bg-primary-green)"}
                        text={translate('question_recheck', language)}
                        handleClick={() => setPopupOpened(false)}
                    />

                    <CustomButton
                        color={"white"}
                        bg={"var(--bg-primary-green)"}
                        border={"1px solid var(--bg-primary-green)"}
                        text={nextTest == "video_learning" ? translate('continue', language) : translate('question_finished', language)}
                        handleClick={handleConfirm}
                    />
                </ButtonFixBottomPopup>
            </div>
        </Popup>
    )
}

export default QuestionPopup