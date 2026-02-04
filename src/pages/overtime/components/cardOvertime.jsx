import React from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { Button, f7 } from 'framework7-react'
import { translate } from '../../../utils/translate'
import { selectLanguages } from '../../../slices/languagesSlice'
import { formatDate } from '../../../functions/formatDate'
import { PiDotsThreeOutlineVertical } from 'react-icons/pi'
import { getHoursMinutes } from '../../../functions/getHoursMinutes'

const CardOvertime = ({ item, index, openCancelPopup }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const today = new Date()


    const handleLink = (id) => {
        localStorage.setItem("overtime_data", JSON.stringify(item));
        f7.views.main.router.navigate(`/overtime-detail/${id}/`)
    }

    return (
        <div key={index} style={{ borderRadius: "12px", fontSize: "var(--font-sm)", marginBottom: "10px", background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)", boxShadow: "0px 2px 16px 0px rgba(0,0,0,0.1)" }}>
            <div style={{ borderBottom: theme == "light" ? "1px solid var(--border-primary-gray)" : "1px solid #1E1E1E", padding: "5px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "var(--font-xs)" }}>{formatDate(item.created_at, language, "with-weekdays")}</p>

                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 700 }}>
                    {
                        item.status == "approved" ? <p style={{ background: theme == "light" ? "var(--color-bg-green)" : "var(--color-bg-tr-green)", color: "var(--color-green)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('approved', language)}</p>
                            : item.status == "rejected" ? <p style={{ background: theme == "light" ? "var(--color-bg-red)" : "var(--color-bg-tr-red)", color: "var(--color-red)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('rejected', language)}</p>
                                : item.status == "idle" ? <p style={{ background: theme == "light" ? "var(--color-bg-yellow)" : "var(--color-bg-tr-yellow)", color: "var(--color-yellow)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('waiting_approval', language)}</p>
                                    : <p style={{ background: theme == "light" ? "var(--color-bg-gray)" : "var(--color-bg-tr-gray)", color: theme == "light" ? "var(--color-gray-light)" : "var(--color-gray-dark)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('canceled', language)}</p>
                    }

                    {
                        item.status == "idle" && (
                            <Button onClick={() => openCancelPopup(item.id, item.type_of_overtime)} style={{ width: "20px", padding: 0, margin: 0, marginLeft: "-8px", marginRight: "-10px", display: "flex", justifyContent: "center", alignItems: "center", background: "none", border: "none", color: theme == "light" ? "black" : "white" }}>
                                <PiDotsThreeOutlineVertical size={"20px"} />
                            </Button>
                        )
                    }
                </div>
            </div>

            <div onClick={() => handleLink(item.id)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontWeight: 400, padding: "10px 15px" }}>
                <p style={{ margin: "4px 0" }}>{translate('overtime_type', language)}</p>
                <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{item.type_of_overtime}</p>

                <p style={{ margin: "4px 0" }}>{translate('overtime_date', language)}</p>
                <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{formatDate(item.start_date, language, "with-weekdays")}</p>

                <p style={{ margin: "4px 0" }}>{translate('start_hour', language)}</p>
                <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{getHoursMinutes(item.start_overtime)}</p>

                <p style={{ margin: "4px 0" }}>{translate('end_hour', language)}</p>
                <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{getHoursMinutes(item.end_overtime)}</p>
            </div>
        </div>
    )
}

export default CardOvertime