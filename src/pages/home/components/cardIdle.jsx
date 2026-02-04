import React from 'react'
import { translate } from '../../../utils/translate'
import { useSelector } from 'react-redux'
import { selectLanguages } from '../../../slices/languagesSlice'
import { selectSettings } from '../../../slices/settingsSlice'
import { formatDate } from '../../../functions/formatDate'

const CardIdle = ({ item, handleLink, leaveTypes }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    console.log("item cardIddle :", item);


    const labelFilter = (type_of_leave, type, title) => {
        if (type == "leave" || type == "permission") {
            const filter = leaveTypes.find(item => item.code == type_of_leave)
            return filter.name
        } else if (type == "overtime") {
            return "Lembur"
        } else {
            return title
        }
    }

    return (
        <div onClick={() => handleLink(item.id, item.type, item)} style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)", borderRadius: "12px", marginBottom: "10px", boxShadow: "0 2px 16px 0 rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--font-xs)", padding: "15px 20px 0 15px", borderBottom: theme == "light" ? "1px solid var(--border-primary-gray)" : "transparent" }}>
                <p>{formatDate(item.created_at, language)}</p>

                {
                    item.status == "approved" ? <p style={{ background: theme == "light" ? "var(--color-bg-green)" : "var(--color-bg-tr-green)", color: "var(--color-green)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('approved', language)}</p>
                        : item.status == "rejected" ? <p style={{ background: theme == "light" ? "var(--color-bg-red)" : "var(--color-bg-tr-red)", color: "var(--color-red)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('rejected', language)}</p>
                            : item.status == "idle" ? <p style={{ background: theme == "light" ? "var(--color-bg-yellow)" : "var(--color-bg-tr-yellow)", color: "var(--color-yellow)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('waiting_approval', language)}</p>
                                : <p style={{ background: theme == "light" ? "var(--color-bg-gray)" : "var(--color-bg-tr-gray)", color: theme == "light" ? "var(--color-gray-light)" : "var(--color-gray-dark)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('canceled', language)}</p>
                }
            </div>

            <div style={{ padding: "20px", paddingTop: "20px" }}>
                <p style={{ fontSize: "var(--font-lg)", fontWeight: 700, margin: 0 }}>{labelFilter(item.type_of_leave, item.type, item.title)}</p>
                <p style={{ fontSize: "var(--font-sm)", margin: 0, marginTop: "5px" }}>{item.name}</p>
            </div>
        </div>
    )
}

export default CardIdle