import React from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { translate } from '../../../utils/translate'

const ResultTab = ({ date, minScore, score, data }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    console.log("data question: ", data);

    if (!Array.isArray(data) || data.length === 0) {
        return <p style={{ textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#6B7280" }}>Loading...</p>
    }

    return (
        <div style={{ fontSize: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ fontWeight: "600" }}>
                    <p style={{ margin: "10px 0" }}>{translate('result_training_work_date', language)}</p>
                    <div style={{ backgroundColor: "#E5E7EB", color: "#6B7280", padding: "2px 10px", borderRadius: "10px", fontWeight: "400" }}>
                        <p>{date}</p>
                    </div>
                </div>

                <div style={{ fontWeight: "600" }}>
                    <p style={{ margin: "10px 0" }}>{translate('result_training_nkm', language)}</p>
                    <div style={{ backgroundColor: "#E5E7EB", color: "#6B7280", padding: "2px 10px", borderRadius: "10px", fontWeight: "400" }}>
                        <p>{minScore}</p>
                    </div>
                </div>
            </div>

            <p style={{ marginTop: "10px" }}>{translate('result_training_passing_score', language)}</p>
            <div
                style={{
                    padding: "15px 10px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    backgroundColor: score >= minScore ? "#D1FAE5" : "#FEE2E2",
                    color: score >= minScore ? "var(--color-green)" : "#B91C1C",
                    border: `2px solid ${score >= minScore ? "var(--color-green)" : "#B91C1C"}`,
                }}
            >
                {score}
            </div>

            {data.map((q, qIndex) => (
                <div key={qIndex}>
                    <p style={{ fontWeight: "700", marginTop: "60px" }}>{translate('result_training_question_no', language)} {qIndex + 1}</p>
                    <div style={{ borderRadius: "8px", marginBottom: "5px", border: "1px solid #9CA3AF" }}>
                        {q.image && <img src={q.image} alt="Image Question" style={{ width: "100%", height: "300px", objectFit: "contain" }} />}
                        <div style={{ padding: "5px 10px" }}>
                            <p>{q.question}</p>
                        </div>
                    </div>

                    <p style={{ fontWeight: "700", marginTop: "30px" }}>{translate('result_training_answer_no', language)} {qIndex + 1}</p>
                    <div style={{ marginTop: "10px" }}>
                        {Array.isArray(q.quiz_options) ? (
                            q.quiz_options.map((opt, optIndex) => (
                                <div
                                    key={optIndex}
                                    style={{
                                        padding: "10px",
                                        borderRadius: "8px",
                                        marginBottom: "8px",
                                        border: `2px solid ${opt.is_correct ? "var(--color-green)" : "#9CA3AF"}`,
                                        backgroundColor: opt.is_correct ? "#D1FAE5" : "transparent",
                                        color: opt.is_correct ? "var(--color-green)" : (theme === "light" ? "black" : "white"),
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <div style={{ background: "rgba(212, 226, 253, 0.1)", padding: "3px 8px", borderRadius: "50px", marginRight: "10px" }}>
                                        <p style={{ margin: 0 }}>{String.fromCharCode(65 + optIndex)}</p>
                                    </div>
                                    <p>{opt.answer}</p>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: "#B91C1C", fontSize: "12px", fontStyle: "italic" }}>{translate('result_training_answer_not_available', language)}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ResultTab
