import React from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { FaArrowTrendDown, FaArrowTrendUp } from 'react-icons/fa6'
import { labelFilter } from '../../../functions/labelFilter'
import { formatDate } from '../../../functions/formatDate'
import { getHoursMinutes } from '../../../functions/getHoursMinutes'

const CardPerformance = ({ item }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "15px",
            background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)",
            borderRadius: "12px",
            marginBottom: "15px",
            boxShadow: "0px 2px 16px 0px rgba(0,0,0,0.1)"
        }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: (item.point_activity === "plus" && theme === "light") ? "var(--color-bg-green)" : (item.point_activity === "plus" && theme !== "light") ? "var(--color-bg-tr-green)" : (item.point_activity !== "plus" && theme === "light") ? "var(--color-bg-red)" : "var(--color-bg-tr-red)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "15px"
                }}>
                    {item.point_activity === "plus" ? <FaArrowTrendUp size={"18px"} color='var(--color-green)' /> : <FaArrowTrendDown size={"18px"} color='var(--color-red)' />}
                </div>

                <div>
                    <p style={{ margin: "0", fontWeight: "600", fontSize: "var(--font-sm)" }}>{labelFilter(item.label, language)}</p>
                    <p style={{ margin: "0", color: "#888", fontSize: "var(--font-xs)" }}>{`${formatDate(item.tanggal, language, "with-weekdays")} - ${getHoursMinutes(item.tanggal)}`}</p>
                </div>
            </div>

            <div style={{
                backgroundColor: (item.point_activity === "plus" && theme === "light") ? "var(--color-bg-green)" : (item.point_activity === "plus" && theme !== "light") ? "var(--color-bg-tr-green)" : (item.point_activity !== "plus" && theme === "light") ? "var(--color-bg-red)" : "var(--color-bg-tr-red)",
                color: item.point_activity === "plus" ? "var(--color-green)" : "var(--color-red)",
                padding: "5px 12px",
                borderRadius: "20px",
                fontWeight: "600",
                fontSize: "var(--font-xxs)"
            }}>
                {item.point_activity === "plus" ? `+${item.point} Pts` : `-${Math.abs(item.point)} Pts`}
            </div>
        </div>
    )
}

export default CardPerformance