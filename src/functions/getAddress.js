import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectLanguages } from "../slices/languagesSlice";
import { translate } from "../utils/translate";
import { API } from "../api/axios";

export const GetAddress = ({ locationData }) => {
    const [address, setAddress] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const language = useSelector(selectLanguages);

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        setIsLoading(true);

        const fetchGeocode = async () => {
            try {
                const response = await API.get('geocode-reverse-api');
                const data = response.data.payload;
                // console.log("data fetch geocode :", data);
                return data.url;
            } catch (err) {
                console.error("Failed to fetch geocode URL:", err);
                return null;
            }
        };

        const fetchAddress = async () => {
            const geocodeUrl = await fetchGeocode();

            if (!geocodeUrl) {
                setError(translate('failed_to_get_address', language));
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`${geocodeUrl}?lat=${locationData.lat}&lon=${locationData.lng}&format=json`, {
                    headers: {
                        'User-Agent': 'BiPro/1.0 (email@email.com)',
                    },
                    signal: controller.signal
                });

                const data = await res.json();
                if (data && data.display_name) {
                    // console.log("Fetched address from dynamic geocode URL:", data);
                    setAddress(data.display_name);
                    localStorage.setItem("address", data.display_name);
                } else {
                    throw new Error("Invalid address data");
                }
            } catch (err) {
                console.warn("Primary or fallback API failed:", err);
                try {
                    const fallback = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${locationData.lat}&lon=${locationData.lng}&format=json`, {
                        headers: {
                            'User-Agent': 'BiPro/1.0 (email@email.com)'
                        }
                    });
                    const fallbackData = await fallback.json();
                    if (fallbackData && fallbackData.display_name) {
                        // console.log("Fallback OSM address:", fallbackData);
                        setAddress(fallbackData.display_name);
                        localStorage.setItem("address", fallbackData.display_name);
                    } else {
                        setError(translate('address_not_found', language));
                    }
                } catch (fallbackError) {
                    console.error("Error in fallback fetch:", fallbackError);
                    setError(translate('failed_to_get_address', language));
                }
            } finally {
                clearTimeout(timeoutId);
                setIsLoading(false);
            }
        };

        fetchAddress();

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [locationData]);

    if (isLoading) return translate('search_address', language);
    if (error) return error;
    if (address) return address.length > 32 ? address.slice(0, 32) + "..." : address;
    return null;
};
