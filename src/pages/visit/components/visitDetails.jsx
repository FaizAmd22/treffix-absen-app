import { f7, Page } from 'framework7-react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import VisitImage2 from "../../../assets/user-pic.jpeg"
import FullImagePopup from '../../../components/fullImagePopup'
import BackButton from '../../../components/backButton'
import { translate } from '../../../utils/translate'
import { selectLanguages } from '../../../slices/languagesSlice'
import { formatDate } from '../../../functions/formatDate'

const VisitDetails = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [userLocation, setUserLocation] = useState({ lat: -6.2661715, lng: 106.6307022 });
    const [fullImagePopupOpened, setFullImagePopupOpened] = useState(false);
    const [imagePopup, setImagePopup] = useState(null);
    const today = new Date()

    useEffect(() => {
        localStorage.setItem("location_lat", userLocation.lat)
        localStorage.setItem("location_lng", userLocation.lng)
    }, [])

    const handleOpenPopup = (image) => {
        setImagePopup(image);
        setFullImagePopupOpened(true);
    };

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "15px", marginBottom: "10px", fontSize: "var(--font-sm)", color: theme === "light" ? "black" : "white" }}>
                <BackButton label={translate('visit_detail', language)} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontWeight: 400 }}>
                    <p style={{ margin: "10px 0" }}>{translate('visit_date', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{formatDate(today, language, "with-weekdays")}</p>

                    <p style={{ margin: "10px 0" }}>{translate('visit_in', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>11:23</p>

                    <p style={{ margin: "10px 0" }}>{translate('visit_out', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>17:53</p>

                    <p style={{ margin: "10px 0" }}>{translate('visit_address_name', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>Alfa Tower</p>

                    <p style={{ margin: "10px 0" }}>{translate('visit_pin_point_address', language)}</p>
                    <p onClick={() => f7.views.main.router.navigate('/visit-map/')} style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", color: "var(--bg-primary-green)" }}>{translate('visit_view_pin_point_address', language)}</p>
                </div>

                <p style={{ fontWeight: 700, margin: 0, marginTop: "20px" }}>{translate('visit_in_proof', language)}</p>
                <div
                    type="button"
                    onClick={() => handleOpenPopup(VisitImage2)}
                    style={{ width: "100%", height: "100%", borderRadius: "8px", padding: 0, border: "none" }}>
                    <img src={VisitImage2} alt="uploaded" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }} />
                </div>

                <p style={{ fontWeight: 700, margin: 0, marginTop: "10px" }}>{translate('visit_out_proof', language)}</p>
                <div
                    type="button"
                    onClick={() => handleOpenPopup(VisitImage2)}
                    style={{ width: "100%", height: "100%", borderRadius: "8px", padding: 0, border: "none" }}>
                    <img src={VisitImage2} alt="uploaded" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }} />
                </div>
            </div>

            <FullImagePopup
                opened={fullImagePopupOpened}
                onClose={() => setFullImagePopupOpened(false)}
                imageSrc={imagePopup}
            />
        </Page>
    )
}

export default VisitDetails
