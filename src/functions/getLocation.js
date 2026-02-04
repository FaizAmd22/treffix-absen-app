import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectLanguages } from "../slices/languagesSlice";
import { translate } from "../utils/translate";

const GetLocation = ({ onLocationFound }) => {
    const [error, setError] = useState(null);
    const [isSearching, setIsSearching] = useState(true);
    const language = useSelector(selectLanguages)

    useEffect(() => {
        if (!navigator.geolocation) {
            setError(translate('geolocation_not_supported', language));
            setIsSearching(false);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 0,
        };

        let watchId;
        let bestPosition = null;

        const successCallback = (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            // console.log(`Lokasi diperoleh: ${latitude}, ${longitude} (Akurasi: ${accuracy}m)`);

            // Simpan lokasi pertama sebagai bestPosition
            // if (accuracy < 50) {
            //     onLocationFound({
            //         lat: latitude,
            //         lng: longitude,
            //     });
            //     localStorage.setItem("location_lat", latitude)
            //     localStorage.setItem("location_lng", longitude)
            //     setIsSearching(false)
            //     return;
            // }

            if (!bestPosition) {
                bestPosition = position;
                // console.log("Best position pertama disimpan:", bestPosition.coords);
                return;
            }

            // Jika lokasi baru lebih akurat dari bestPosition, perbarui
            if (accuracy < bestPosition.coords.accuracy) {
                bestPosition = position;
                // console.log("Best position diperbarui:", bestPosition.coords);
            }
        };

        const errorCallback = (err) => {
            console.error("Gagal mendapatkan lokasi:", err);
            setError(translate('location_signal_weak', language));
            setIsSearching(false);
        };

        watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options);

        const timeoutId = setTimeout(() => {
            navigator.geolocation.clearWatch(watchId);
            if (bestPosition) {
                onLocationFound({
                    lat: bestPosition.coords.latitude,
                    lng: bestPosition.coords.longitude,
                });
                localStorage.setItem("location_lat", bestPosition.coords.lat)
                localStorage.setItem("location_lng", bestPosition.coords.lng)
            } else {
                setError(translate('location_not_found', language));
            }
            setIsSearching(false);
        }, 3000);

        return () => {
            navigator.geolocation.clearWatch(watchId);
            clearTimeout(timeoutId);
        };
    }, [onLocationFound]);

    if (isSearching) return translate('location_loading', language)
    if (error) return error;
    return null;
};

export default GetLocation;
