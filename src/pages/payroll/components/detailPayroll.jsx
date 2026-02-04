import { Button } from 'framework7-react'
import React from 'react'
import { useSelector } from 'react-redux'
import { formatRupiah } from '../../../functions/formatRupiah'
import { selectSettings } from '../../../slices/settingsSlice'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { formatDate } from '../../../functions/formatDate'
import { selectLanguages } from '../../../slices/languagesSlice'

const DetailPayroll = ({ data, index, setIsDetail }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    console.log("data di detailPayroll :", data[index]);
    console.log("index detailPayroll :", index);

    return (
        <>
            <div style={{ padding: 0, marginBottom: "120px" }}>
                <div style={{ color: theme == "light" ? "black" : "white", display: "flex", alignItems: "center", padding: "15px" }} onClick={() => setIsDetail(false)}>
                    <IoIosArrowRoundBack size={"25px"} style={{ marginRight: "10px" }} />

                    <p style={{ fontSize: "16px", fontWeight: "600" }}>Detail Gaji {formatDate(data[index].date, language, "month-year")}</p>
                </div>

                <div style={{ padding: "0 20px" }}>
                    <p style={{ fontSize: "16px", fontWeight: 700 }}>Detail Penghitungan Gaji</p>

                    <div style={{ display: "grid", gridTemplateColumns: "50% 50%", fontSize: "12px", fontWeight: 400 }}>
                        <p style={{ margin: "5px 0" }}>Gaji Pokok</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700 }}>{formatRupiah(data[index].gaji_pokok)}</p>

                        <p style={{ margin: "5px 0" }}>Tunjangan Kehadiran</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700 }}>{formatRupiah(data[index].tunjangan_kehadiran)}</p>

                        <p style={{ margin: "5px 0" }}>Tunjangan Makan</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700 }}>{formatRupiah(data[index].tunjangan_makan)}</p>

                        <p style={{ margin: "5px 0" }}>Tunjangan Transport</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700 }}>{formatRupiah(data[index].tunjangan_transport)}</p>

                        <p style={{ margin: "5px 0" }}>BPJS Kesehatan (1%)</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700, color: "var(--color-red)" }}>-{formatRupiah(data[index].bpjs_kesehatan)}</p>

                        <p style={{ margin: "5px 0" }}>BPJS TK (3%)</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700, color: "var(--color-red)" }}>-{formatRupiah(data[index].bpjs_tk)}</p>

                        <p style={{ margin: "5px 0" }}>PPh21</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700, color: "var(--color-red)" }}>-{formatRupiah(data[index].pph21)}</p>

                        <p style={{ margin: "5px 0" }}>Lembur</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700 }}>{formatRupiah(data[index].lembur)}</p>

                        <hr style={{ color: theme == "light" ? " var(--border-primary-gray)" : "#363636", width: "100%", height: "2px", gridColumn: "1 / 3" }} />

                        <p style={{ margin: "5px 0" }}>Gaji Bruto</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700, color: "var(--color-green)" }}>{formatRupiah(data[index].gaji_bruto)}</p>
                    </div>

                    <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "40px" }}>Total Gaji Bulan Ini</p>

                    <div style={{ display: "grid", gridTemplateColumns: "50% 50%", fontSize: "12px", fontWeight: 400 }}>
                        <p style={{ margin: "5px 0" }}>Gaji Bruto</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700 }}>{formatRupiah(data[index].gaji_bruto)}</p>

                        <p style={{ margin: "5px 0" }}>Denda</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700, color: "var(--color-red)" }}>-{formatRupiah(data[index].denda)}</p>

                        <p style={{ margin: "5px 0" }}>Bonus</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700 }}>{formatRupiah(data[index].bonus)}</p>

                        <hr style={{ color: theme == "light" ? " var(--border-primary-gray)" : "#363636", width: "100%", height: "2px", gridColumn: "1 / 3" }} />

                        <p style={{ margin: "5px 0" }}>Total Gaji Bulan Ini (THP)</p>
                        <p style={{ margin: "5px 0", textAlign: "right", fontWeight: 700, color: "var(--color-green)" }}>{formatRupiah(data[index].total_gaji)}</p>
                    </div>
                </div>

            </div >

            <div style={{ width: "100%", height: "80px", borderTop: theme == "light" ? "1px solid var(--border-primary-gray)" : "1px solid #363636", background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", position: "fixed", bottom: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Button style={{ width: "90%", backgroundColor: "var(--bg-primary-green)", color: "white", fontSize: "14px", fontWeight: "700", padding: "20px 0px", textTransform: "capitalize", borderRadius: "8px", marginBottom: "10px" }}>
                    <p>Download Slip Gaji</p>
                </Button>
            </div>
        </>
    )
}

export default DetailPayroll