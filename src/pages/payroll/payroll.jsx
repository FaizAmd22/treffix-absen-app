import { Button, Page } from 'framework7-react'
import React, { useState } from 'react'
import BackButton from '../../components/backButton'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../slices/settingsSlice'
import DataPayroll from "./dataPayroll.json"
import { formatDate } from '../../functions/formatDate'
import { selectLanguages } from '../../slices/languagesSlice'
import DetailPayroll from './components/detailPayroll'
import { formatRupiah } from '../../functions/formatRupiah'

const PayrollPage = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [index, setIndex] = useState(null)
    const [isDetail, setIsDetail] = useState(false)

    const handleClick = (index) => {
        console.log("data index :", index);
        setIndex(index)
        setIsDetail(true)
    }

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", color: theme == "light" ? "black" : "white", padding: 0, margin: 0 }}>
            {
                isDetail ? (
                    <DetailPayroll data={DataPayroll} index={index} setIsDetail={setIsDetail} />
                ) : (
                    <div style={{ padding: "15px", marginBottom: "90px" }}>
                        <BackButton label="Payroll" />

                        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
                            {
                                DataPayroll.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleClick(index)}
                                        style={{ border: theme == "light" ? "1px solid #DEDEDE" : "1px solid #1E1E1E", borderRadius: "12px" }}
                                    >
                                        <div style={{ borderBottom: theme == "light" ? "1px solid #DEDEDE" : "1px solid #1E1E1E" }}>
                                            <p style={{ fontSize: "10px", fontWeight: 400, padding: "0 15px" }}>{formatDate(item.date, language)}</p>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 15px", fontWeight: 700, fontSize: "14px" }}>
                                            <p>{formatDate(item.date, language, "month-year")}</p>

                                            <p>{formatRupiah(item.total_gaji)}</p>
                                        </div>
                                    </div>
                                )
                                )
                            }
                        </div>
                    </div>
                )
            }
        </Page>
    )
}

export default PayrollPage