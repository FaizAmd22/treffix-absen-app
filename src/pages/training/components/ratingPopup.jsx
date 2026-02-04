import React, { useState } from "react";
import { Popup, Button, f7 } from "framework7-react";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../slices/settingsSlice";
import Star from "../../../assets/icons/star.svg";
import StarOutline from "../../../assets/icons/star-outline.svg";
import { API } from "../../../api/axios";
import { selectLanguages } from "../../../slices/languagesSlice";
import { translate } from "../../../utils/translate";
import { showToastFailed } from "../../../functions/toast";

const RatingPopup = ({ ratingOpened, setRatingOpened }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages)
    const token = localStorage.getItem("token")

    // console.log("rating :", rating);
    // console.log("feedback :", feedback);


    const ratingLabels = [
        translate('rating_awful', language),
        translate('rating_bad', language),
        translate('rating_normal', language),
        translate('rating_good', language),
        translate('rating_great', language)
    ];

    const handleConfirmRating = () => {
        if (rating === 0 && feedback.trim() === "") {
            setErrorMessage(translate('rating_error_both_empty', language));
            return;
        } else if (rating === 0) {
            setErrorMessage(translate('rating_error_no_rating', language));
            return;
        } else if (feedback.trim() === "") {
            setErrorMessage(translate('rating_error_no_feedback', language));
            return;
        }

        setErrorMessage("");

        const id = f7.views.main.router.currentRoute.params.id;

        const fetchSubmit = async () => {
            const data = {
                review: feedback,
                rating: rating,
            }

            try {
                const response = await API.post(`/user-developments/${id}/reviews`, data)

                // console.log("response :", response.data);
                setRatingOpened(false)
                f7.views.main.router.navigate(`/result/${id}/`, { clearPreviousHistory: true, });
            } catch (error) {
                console.log("error :", error);
                // f7.dialog.alert(translate('rating_failed_submit', language))
                showToastFailed(translate('rating_failed_submit', language))
            }
        }

        fetchSubmit()
    }

    return (
        <Popup
            opened={ratingOpened}
            onPopupClosed={() => setRatingOpened(false)}
            closeByBackdropClick={false}
            style={{
                width: "90%",
                height: "54%",
                borderRadius: "12px",
                position: "absolute",
                top: 180,
                left: 20,
                background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)",
            }}
        >
            <div style={{ height: "80%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px", fontSize: "var(--font-sm)", color: theme === "light" ? "black" : "white", }}>
                <p style={{ margin: 0, padding: "5px 0 20px 0", fontSize: "var(--font-lg)", fontWeight: 700, marginTop: 0 }}>{translate('give_rating', language)}</p>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "center", height: "100%" }}>
                    <div>
                        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                    key={star}
                                    onClick={() => setRating(star)}
                                >
                                    <img
                                        src={star <= rating ? Star : StarOutline}
                                        alt={`Star ${star}`}
                                        style={{ width: "30px", height: "30px" }}
                                    />
                                </div>
                            ))}
                        </div>

                        <p style={{ margin: 0, paddingBottom: "10px", fontWeight: 400 }}>{rating > 0 ? ratingLabels[rating - 1] : translate('give_rating_text', language)}</p>
                    </div>

                    <textarea
                        placeholder={translate('give_rating_advice', language)}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        style={{
                            width: "100%",
                            height: "120px",
                            padding: "10px",
                            borderRadius: "8px",
                            border: !feedback ? "1px solid #363636" : "1px solid var(--color-green)",
                            overflowY: "auto",
                            fontWeight: 400
                        }}
                    />

                    {errorMessage && (
                        <div style={{
                            color: "var(--color-danger, #ff3b30)",
                            marginTop: "5px",
                            textAlign: "left",
                            marginBottom: "5px"
                        }}>
                            {errorMessage}
                        </div>
                    )}

                    <Button fill largeMd onClick={handleConfirmRating} style={{ marginTop: "20px", textTransform: "capitalize" }}>
                        {translate('done', language)}
                    </Button>
                </div>
            </div>
        </Popup>
    );
};

export default RatingPopup;