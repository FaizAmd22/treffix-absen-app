import { Block, Popup, Preloader } from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../slices/settingsSlice'
import LoadingImage from '../assets/loading/loading-blue.json'
import LottieWebAnimation from './LottieWebAnimation'
import { useRef } from 'react'

const LoadingPopup = ({ popupOpened, setPopupOpened }) => {
    const theme = useSelector(selectSettings)
    const lottieRef = useRef(null)

    return (
        <Popup
            opened={popupOpened}
            onPopupClose={() => setPopupOpened(false)}
            style={{ width: "100%", height: "100vh", borderRadius: "12px", position: "absolute", background: "rgba(0, 0, 0, 0.5)" }}
        >
            <div style={{ height: '100vh', display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0)" }}>
                <LottieWebAnimation ref={lottieRef} path={LoadingImage} width={"180px"} height={"180px"} />
            </div>
        </Popup>
    )
}

export default LoadingPopup