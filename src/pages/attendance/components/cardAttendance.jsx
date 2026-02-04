import React from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { formatDate } from '../../../functions/formatDate'
import { getHoursMinutes } from '../../../functions/getHoursMinutes'
import { translate } from '../../../utils/translate'

const CardAttendance = ({ item, leaveTypes }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    console.log("language :", language);


    const labelFilter = (data) => {
        if (data == "ontime") {
            return translate('attendance_ontime', language)
            // return "Hadir - Tepat Masuk"
        } else if (data == "late") {
            return translate('attendance_late', language)
            // return "Hadir - Telat Masuk"
        } else if (data == "UL") {
            return "Unpaid Leave"
        } else if (data == "leave") {
            return translate('attendance_permission', language)
            // return "Cuti / Izin"
        } else if (data == "overtime") {
            return translate('overtime', language)
        } else {
            const filter = leaveTypes.find(item => item.code == data)
            return filter ? filter.name : data
        }
    }

    return (
        <div key={item.month} style={{
            width: "95% ", boxShadow: "0 2px 16px 0 rgba(0,0,0,0.1)", padding: "0 15px", paddingRight: language == "id" ? "2px" : "10px", margin: "10px 0px", background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg - secondary - gray)", borderRadius: "5px", color: theme === "light" ? "black" : "white"
        }} className='grid grid-cols-8'>
            <p p style={{ gridColumn: "span 4", fontSize: "var(--font-sm)", fontWeight: "bold", marginBottom: "5px" }
            }> {formatDate(item.attendance_date, language, "with-weekdays")}</p >
            <p style={{ gridColumn: "span 2", textAlign: "center", marginBottom: "5px", fontSize: "var(--font-xs)" }}>{translate('attendance_clockin', language)}</p>
            <p style={{ gridColumn: "span 2", textAlign: "center", marginBottom: "5px", fontSize: "var(--font-xs)" }}>{translate('attendance_clockout', language)}</p>
            <p style={{ gridColumn: "span 4", marginTop: "0", fontSize: "var(--font-xs)", color: item.status == "UL" ? "var(--color-red)" : theme === "light" ? "black" : "white", textTransform: "capitalize" }}>{labelFilter(item.status)}</p>
            <p style={{ gridColumn: "span 2", textAlign: "center", fontWeight: "bold", marginTop: "0", color: item.status == "late" ? "var(--color-red)" : theme === "light" ? "black" : "white" }}>{(item.clock_in && (item.status == "ontime" || item.status == "late" || item.status == "overtime")) ? getHoursMinutes(item.clock_in) : "--:--"}</p>
            <p style={{ gridColumn: "span 2", textAlign: "center", fontWeight: "bold", marginTop: "0" }}>{(item.clock_out && (item.status == "ontime" || item.status == "late" || item.status == "overtime")) ? getHoursMinutes(item.clock_out) : "--:--"}</p>
        </div >
    )
}

export default CardAttendance