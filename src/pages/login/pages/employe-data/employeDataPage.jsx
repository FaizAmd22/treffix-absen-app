import Image from '../../../../assets/icons/employe-data.svg'
import { f7, Page } from 'framework7-react'
import ButtonFixBottom from '../../../../components/buttonFixBottom'
import CustomButton from '../../../../components/customButton'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../../slices/settingsSlice'

const EmployeDataPage = () => {
    const theme = useSelector(selectSettings)

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ textAlign: "center", width: "100%", background: "linear-gradient(1deg,rgba(40, 111, 243, 0) 40%, rgba(40, 111, 243, 0.5) 100%)", color: theme === "light" ? "black" : "white" }}>
                <div style={{ width: "100%", height: "450px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img src={Image} alt="Dokumen" style={{ width: "65%", height: "450px", objectFit: "contain" }} />
                </div>

                <div style={{ width: "100%", marginTop: "-30px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <p style={{ fontSize: "var(--font-xl)", fontWeight: 700, width: "85%", margin: 0 }}>Lengkapi Data Anda</p>
                    <p style={{ fontSize: "var(--font-sm)", width: "85%" }}>Lengkapi data pribadi untuk memulai proses onboarding. Data ini akan membantu HR mempersiapkan segala kebutuhan kerja Anda.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "end", alignItems: "center", position: "absolute", bottom: "11%", width: "100%" }}>
                    <div style={{ display: "flex", gap: "5px", justifyContent: "center", alignItems: "center", marginBottom: "15px" }}>
                        <div style={{ background: "#F0F0F0", width: "8px", height: "8px", borderRadius: "100%" }} />
                        <div style={{ background: "#F0F0F0", width: "8px", height: "8px", borderRadius: "100%" }} />
                        <div style={{ background: "#F0F0F0", width: "8px", height: "8px", borderRadius: "100%" }} />
                        <div style={{ background: "var(--bg-primary-green)", width: "72px", height: "8px", borderRadius: "20px" }} />
                    </div>
                </div>
            </div>

            <ButtonFixBottom needBorderTop={false}>
                <CustomButton
                    handleClick={() => {
                        f7.views.main.router.navigate('/employe-data-list/')
                        localStorage.setItem("isOnboarding", "true")
                    }}
                    color={"white"}
                    bg={"var(--bg-primary-green)"}
                    text={"Mulai Lengkapi Data Karyawan"}
                />
            </ButtonFixBottom>
        </Page>
    )
}

export default EmployeDataPage