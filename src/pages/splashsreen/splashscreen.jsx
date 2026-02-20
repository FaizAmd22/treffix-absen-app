import { f7, Page } from 'framework7-react'
import { useEffect, useRef } from 'react'
import { API } from '../../api/axios'
import { useDispatch } from 'react-redux'
import { updateUser } from '../../slices/userSlice'
import imageSplashscreen from '../../assets/splashscreen.svg'
import LottieWebAnimation from '../../components/LottieWebAnimation'
import LoadingImage from '../../assets/loading/loading-white.json'

const Splashscreen = () => {
    const dispatch = useDispatch()
    const lottieRef = useRef(null)

    const fetchData = async () => {
        try {
            const fetchUser = await API.get("/mobile/auth/me");
            const fetchKtp = await API.get("/mobile/employees/personal");
            const getSteps = await API.get("/mobile/employees/onboarding/steps");

            const dataKtp = fetchKtp.data.payload;
            const userData = fetchUser.data.payload;
            const completedSteps = getSteps.data.payload?.completed_steps || [];

            const hasKTP = dataKtp.documents?.some(doc => doc.document_name?.toLowerCase() === 'ktp');

            if (hasKTP && completedSteps.includes("employe_data")) {
                dispatch(updateUser(userData));
                f7.views.main.router.navigate("/home/", { clearPreviousHistory: "true" })
            } else {
                f7.views.main.router.navigate("/login/", { clearPreviousHistory: "true" })
            }
        } catch (error) {
            f7.views.main.router.navigate("/login/", { clearPreviousHistory: "true" })
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            fetchData()
        }, 3000);
    }, [])

    return (
        <Page style={{ background: "linear-gradient(0deg,rgba(51, 165, 157, 1) 0%, rgba(15, 122, 132, 1) 100%)" }}>
            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                {/* <LottieWebAnimation ref={lottieRef} path={LoadingImage} width={"180px"} height={"180px"} /> */}
                <img
                    src={imageSplashscreen}
                    alt="Splashscreen"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
            </div>
        </Page>
    )
}

export default Splashscreen