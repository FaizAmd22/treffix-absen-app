import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link, Page } from "framework7-react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { selectSettings } from "../slices/settingsSlice";
import { GetAddress } from "../functions/getAddress";
import { selectLanguages } from "../slices/languagesSlice";
import { translate } from "../utils/translate";

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

const MapComponent = () => {
    const location_lat = localStorage.getItem("location_lat")
    const location_lng = localStorage.getItem("location_lng")
    const address = localStorage.getItem("address")
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    const userLocation = {
        lat: location_lat,
        lng: location_lng,
    }

    // console.log("address :", address);
    // console.log("location_lat :", location_lat);
    // console.log("location_lng :", location_lng);
    const location = [Number(location_lat), Number(location_lng)]

    return (
        <Page>
            <div style={{ width: "100vw", background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0))", height: "100px", position: "fixed", top: 0, zIndex: 999 }}>
                <Link back style={{ display: "flex", gap: "3px", justifyContent: "start", paddingTop: "30px", paddingLeft: "20px", fontWeight: 400, fontSize: "var(--font-lg)", color: "white" }}>
                    <IoIosArrowRoundBack size={"25px"} />
                    {translate('visit_pin_point_address', language)}
                </Link>
            </div>

            <div style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", color: theme == "light" ? "black" : "white", padding: "20px", position: "fixed", zIndex: 999, bottom: 0, borderRadius: "40px 40px 0 0" }}>
                <p style={{ fontSize: "var(--font-lg)", paddingBottom: "20px", borderBottom: theme == "light" ? "1px solid #F5F5F5" : "1px solid #282828" }}>{translate('visit_view_pin_point_address_detail', language)}</p>

                <p style={{ paddingTop: "10px", fontSize: "var(--font-md)", fontWeight: 700 }}>{translate('location', language)}</p>

                <p style={{ fontSize: "var(--font-sm)" }}>{address ? address : <GetAddress locationData={userLocation} />}</p>
            </div>

            <MapContainer center={location} zoom={15} style={{ height: "100%", width: "100%", borderRadius: "10px" }} zoomControl={false} >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Circle center={location} radius={80} fillColor="var(--bg-primary-green)" fillOpacity={0.5} stroke={true} />
                <ChangeView center={location} zoom={16} />
            </MapContainer>
        </Page>
    );
};

export default MapComponent;
