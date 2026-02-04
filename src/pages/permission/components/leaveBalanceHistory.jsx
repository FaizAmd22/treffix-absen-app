import { AccordionContent, Block, List, ListItem, Page } from 'framework7-react'
import React, { useEffect, useState } from 'react'
import BackButton from '../../../components/backButton'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { API } from '../../../api/axios'
import { selectUser } from '../../../slices/userSlice'
import { GoInfo } from 'react-icons/go'
import { BiInfoCircle } from 'react-icons/bi'
import GrandLeaveInfoPopup from './grandLeaveInfoPopup'
import { formatDate } from '../../../functions/formatDate'
import { translate } from '../../../utils/translate'

const LeaveBalanceHistory = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const userData = useSelector(selectUser)
    const [groupedData, setGroupedData] = useState({})
    const [popupOpened, setPopupOpened] = useState(false)

    const getPeriodForDate = (date, joinDate) => {
        const joinDateObj = new Date(joinDate)
        const targetDate = new Date(date)

        const joinMonth = joinDateObj.getMonth()
        const joinDay = joinDateObj.getDate()

        let periodYear = targetDate.getFullYear()

        const anniversaryThisYear = new Date(periodYear, joinMonth, joinDay)
        if (targetDate < anniversaryThisYear) {
            periodYear -= 1
        }

        const periodStart = new Date(periodYear, joinMonth, joinDay)
        const periodEnd = new Date(periodYear + 1, joinMonth, joinDay - 1)

        return {
            startDate: periodStart,
            endDate: periodEnd,
            key: `${periodStart.getFullYear()}-${periodEnd.getFullYear()}`,
            label: `${formatDate(periodStart, language)} - ${formatDate(periodEnd, language)}`
        }
    }

    // const groupDataByPeriod = (data, joinDate) => {
    //     const periods = {}

    //     data.forEach(item => {
    //         const period = getPeriodForDate(item.created_at, joinDate)

    //         if (!periods[period.key]) {
    //             periods[period.key] = {
    //                 label: period.label,
    //                 startDate: period.startDate,
    //                 endDate: period.endDate,
    //                 data: []
    //             }
    //         }

    //         periods[period.key].data.push(item)
    //     })

    //     return periods
    // }

    const groupDataByPeriod = (data, joinDateStr) => {
        const periods = {};

        data.forEach(item => {
            let dateForGrouping = item.type_of_leave === 'LCT' && item.start_date
                ? item.start_date
                : item.created_at;

            let groupingDate = new Date(dateForGrouping);

            const period = getPeriodForDate(groupingDate.toISOString(), joinDateStr);

            if (!periods[period.key]) {
                periods[period.key] = {
                    label: period.label,
                    startDate: period.startDate,
                    endDate: period.endDate,
                    data: []
                };
            }

            periods[period.key].data.push(item);
        });

        const joinDate = new Date(joinDateStr);
        const now = new Date();
        let current = new Date(joinDate);
        while (current <= now) {
            const start = new Date(current);
            const end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate() - 1);
            const key = `${start.getFullYear()}-${end.getFullYear()}`;
            const label = `${formatDate(start)} - ${formatDate(end)}`;
            if (!periods[key]) {
                periods[key] = {
                    label: label,
                    startDate: start,
                    endDate: end,
                    data: []
                };
            }
            current.setFullYear(current.getFullYear() + 1);
        }

        return periods;
    };

    const calculatePeriodStats = (periodData) => {
        let quotaCuti = 0
        let bringForward = 0
        let cutiTerpakai = 0
        let cutiBesar = 0
        let cutiExpired = 0

        periodData.forEach(item => {
            if (item.type === 'sum') {
                if (item.is_last_year_leave) {
                    bringForward += item.amount
                } else if (item.type_of_leave === "CT") {
                    quotaCuti += item.amount
                } else if (item.type_of_leave === "LCT") {
                    cutiBesar += item.amount
                }
            } else if (item.type === 'min') {
                if (item.status == "expired") {
                    cutiExpired += item.amount
                } else {
                    cutiTerpakai += item.amount
                }
            }
        })

        const totalSaldo = quotaCuti + bringForward
        const sisaCuti = totalSaldo - cutiTerpakai + cutiBesar

        return {
            quotaCuti,
            bringForward,
            totalSaldo,
            cutiTerpakai,
            cutiExpired,
            cutiBesar,
            sisaCuti
        }
    }

    const fetchData = async () => {
        try {
            const response = await API.get("/mobile/user-leave-statistic?sort_by=created_at+asc")
            const data = response.data.payload
            const userJoined = userData.join_date

            console.log("data riwayat cuti :", data)
            console.log("tanggal join :", userJoined)

            const grouped = groupDataByPeriod(data, userJoined)
            setGroupedData(grouped)

            console.log("grouped data:", grouped)
        } catch (error) {
            console.log("Error fetching chart data:", error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "15px", marginBottom: "20px", fontSize: "var(--font-sm)", color: theme == "light" ? "black" : "white" }}>
                <BackButton label={translate('history_leave_balance', language)} />

                <List accordionList style={{ marginTop: "10px" }}>
                    {Object.keys(groupedData)
                        .sort((a, b) => b.localeCompare(a))
                        .map(periodKey => {
                            const period = groupedData[periodKey]
                            const stats = calculatePeriodStats(period.data)

                            return (
                                <ListItem key={periodKey} accordionItem title={<b>{period.label}</b>}>
                                    <AccordionContent>
                                        <Block style={{ marginBottom: "30px" }}>
                                            <p style={{ fontWeight: 700, margin: "5px 0", paddingTop: "10px" }}>{translate('leave_balance', language)}</p>

                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <p style={{ margin: "5px 0" }}>{translate('leave_quota', language)}</p>
                                                <p style={{ fontWeight: 700, margin: "5px 0" }}>{stats.quotaCuti}</p>
                                            </div>

                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <p style={{ margin: "5px 0" }}>{translate('bring_forward_leave', language)}</p>
                                                <p style={{ fontWeight: 700, margin: "5px 0" }}>{stats.bringForward}</p>
                                            </div>

                                            <hr style={{ border: "1px solid #F5F5F5" }} />

                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <p style={{ margin: "5px 0" }}>{translate('total_leave_balace_this_year', language)}</p>
                                                <p style={{ fontWeight: 700, margin: "5px 0" }}>{stats.totalSaldo}</p>
                                            </div>

                                            <p style={{ fontWeight: 700, margin: "5px 0", paddingTop: "20px" }}>{translate('leave_expired', language)}</p>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <p style={{ margin: "5px 0" }}>{translate('leave_expired', language)}</p>
                                                <p style={{ fontWeight: 700, margin: "5px 0" }}>{stats.cutiExpired}</p>
                                            </div>

                                            <p style={{ fontWeight: 700, margin: "5px 0", paddingTop: "20px" }}>{translate('remaining_leave_amount', language)}</p>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <p style={{ margin: "5px 0" }}>{translate('total_leave_balace_this_year', language)}</p>
                                                <p style={{ fontWeight: 700, margin: "5px 0" }}>{stats.totalSaldo}</p>
                                            </div>

                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <div onClick={() => setPopupOpened(true)} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                    <p style={{ margin: "5px 0" }}>{translate('sabbatical_leave_balance', language)}</p>
                                                    <BiInfoCircle size={18} style={{ color: "var(--bg-primary-green)" }} />
                                                </div>
                                                <p style={{ fontWeight: 700, margin: "5px 0" }}>{stats.cutiBesar}</p>
                                            </div>

                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <p style={{ margin: "5px 0" }}>{translate('used_leave', language)}</p>
                                                <p style={{ fontWeight: 700, margin: "5px 0", color: 'var(--color-red)' }}>{stats.cutiTerpakai}</p>
                                            </div>

                                            <hr style={{ border: "1px solid #F5F5F5" }} />

                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <p style={{ margin: "5px 0" }}>{translate('remaining_leave_amount', language)}</p>
                                                <p style={{ fontWeight: 700, margin: "5px 0" }}>{stats.sisaCuti}</p>
                                            </div>

                                            {/* Debug info - bisa dihapus di production */}
                                            {/*<div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "5px", fontSize: "12px" }}>
                                                <p>Debug: {period.data.length} data items dalam periode ini</p>
                                                <details>
                                                    <summary>Lihat detail data</summary>
                                                    <pre style={{ fontSize: "10px", overflow: "auto" }}>
                                                        {JSON.stringify(period.data, null, 2)}
                                                    </pre>
                                                </details>
                                            </div>*/}
                                        </Block>
                                    </AccordionContent>
                                </ListItem>
                            )
                        })}
                </List>
            </div>

            <GrandLeaveInfoPopup sheetOpened={popupOpened} setSheetOpened={setPopupOpened} />
        </Page>
    )
}

export default LeaveBalanceHistory