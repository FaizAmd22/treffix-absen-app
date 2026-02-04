import { useEffect, useState } from 'react'
import { selectUser } from '../../../slices/userSlice'
import { useSelector } from 'react-redux'
import UserPic from "../../../assets/user-pic.jpeg"
import BgButton from "../../../assets/bgButtonPointPerformance.svg"
import { selectSettings } from '../../../slices/settingsSlice'
import { API } from '../../../api/axios'
import { Progressbar } from 'framework7-react'

const PerformanceUser = ({ data }) => {
    const user = useSelector(selectUser)
    const theme = useSelector(selectSettings)
    const token = localStorage.getItem('token')
    const [gradeData, setGradeData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const nextPoint = 5000

    console.log("gradeData :", gradeData);


    useEffect(() => {
        const fetchGrade = async () => {
            try {
                setIsLoading(true)
                const response = await API.get("/mobile/user-performance-grade");

                const dataGrade = response.data.payload
                console.log("response data grade :", dataGrade);
                setGradeData(dataGrade)
                setIsLoading(false)
            } catch (error) {
                console.log("error get data grade :", error);
                setIsLoading(false)
            }
        }

        if (token) {
            fetchGrade()
        }
    }, [token])

    return (
        <div style={{ margin: "auto", textAlign: "center" }}>
            {!isLoading && gradeData && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                    <img src={user.profile_pic ? user.profile_pic : UserPic} alt="ProfileImage" style={{ width: "140px", height: "140px", objectFit: "cover", borderRadius: "50%", position: "relative", zIndex: 99, border: "5px solid white" }} />

                    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginTop: "-40px", zIndex: 999 }}>
                        <p style={{ color: "white", borderRadius: "4px", padding: "10px 25px", background: "var(--bg-primary-green)", fontWeight: 700, fontSize: "var(--font-sm)" }}>{gradeData.level}</p>
                    </div>

                    <div style={{ background: theme == "light" ? "rgba(217, 218, 220, 0.4)" : "#212121", paddingTop: "80px", paddingBottom: "20px", marginTop: "-85px", borderRadius: "12px", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                        <p style={{ marginBottom: 0, paddingBottom: 0, marginTop: "3px", paddingTop: "3px", fontSize: "var(--font-lg)", fontWeight: "bold" }}>{user?.name}</p>
                        <p style={{ paddingTop: "2px", marginTop: "5px", marginBottom: 0, paddingBottom: 0 }}>{user?.job_position_name}</p>

                        <div style={{ borderRadius: "8px", backgroundImage: `url(${BgButton})`, backgroundSize: "cover", backgroundPosition: "center", marginTop: "15px", width: "88%", padding: "0 15px", paddingBottom: "20px" }}>
                            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--font-xs)" }}>
                                <p style={{ fontWeight: 700, color: "white" }}>{gradeData.level}</p>

                                <p style={{ fontWeight: 700, color: "white", margin: 0 }}>{gradeData.point} Pts / {gradeData.next_level_point} Pts</p>
                            </div>

                            <Progressbar progress={(gradeData.point / gradeData.next_level_point) * 100} color="green" style={{ height: "8px", borderRadius: "360px", background: "rgba(255, 255, 255, 0.1)" }} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default PerformanceUser