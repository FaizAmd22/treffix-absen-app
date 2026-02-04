import Image from '../../../../assets/icons/camera_register.svg'
import { f7, Page } from 'framework7-react'
import ButtonFixBottom from '../../../../components/buttonFixBottom'
import CustomButton from '../../../../components/customButton'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../../slices/settingsSlice'

const RegisterFace = () => {
    const theme = useSelector(selectSettings)

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "center", width: "100%", background: "linear-gradient(1deg,rgba(40, 111, 243, 0) 40%, rgba(40, 111, 243, 0.5) 100%)", color: theme === "light" ? "black" : "white" }}>
                <div style={{ width: "100%", height: "450px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img src={Image} alt="camera" style={{ width: "65%", height: "450px", objectFit: "contain" }} />
                </div>

                <div style={{ width: "100%", marginTop: "-30px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <p style={{ fontSize: "var(--font-xl)", fontWeight: 700, width: "85%", margin: 0 }}>Mulai Dengan Verifikasi Wajah</p>
                    <p style={{ fontSize: "var(--font-sm)", width: "85%" }}>Langkah ini digunakan sebagai metode autentikasi identitas dan juga akan digunakan untuk proses absensi harian Anda.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "end", alignItems: "center", position: "absolute", bottom: "11%", width: "100%" }}>
                    <div style={{ display: "flex", gap: "5px", justifyContent: "center", alignItems: "center", marginBottom: "15px" }}>
                        <div style={{ background: "var(--bg-primary-green)", width: "72px", height: "8px", borderRadius: "20px" }} />
                        <div style={{ background: "#F0F0F0", width: "8px", height: "8px", borderRadius: "100%" }} />
                        <div style={{ background: "#F0F0F0", width: "8px", height: "8px", borderRadius: "100%" }} />
                        <div style={{ background: "#F0F0F0", width: "8px", height: "8px", borderRadius: "100%" }} />
                    </div>
                </div>
            </div>

            <ButtonFixBottom needBorderTop={false}>
                <CustomButton
                    handleClick={() => { f7.views.main.router.navigate('/capture-face/register/') }}
                    // handleClick={() => { f7.views.main.router.navigate('/jobdesc/') }}
                    color={"white"}
                    bg={"var(--bg-primary-green)"}
                    text={"Mulai Foto"}
                />
            </ButtonFixBottom>
        </Page>
    )
}

export default RegisterFace