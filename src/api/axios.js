import axios from "axios";
import { f7 } from "framework7-react";
import { getRefreshToken } from "../functions/getRefreshToken";
import { BiometricAuth } from "../functions/biometricAuth";
import store from '../js/store'
import { updateUser } from "../slices/userSlice";
import { setActiveTab } from "../slices/tabSlice";

const url = import.meta.env.VITE_BASE_URL;

export const API = axios.create({
    baseURL: url
});

export const APIFaceRecog = axios.create({
    baseURL: url
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

API.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        console.log("error di api:", error?.response?.status, error?.response?.data);

        if ((error.response && error.response.status === 401) ||
            (error.response?.data?.message?.toLowerCase().includes('unrecognize')) ||
            (error.response?.data?.message?.toLowerCase().includes('unauthorized'))) {

            if (!originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return API(originalRequest);
                        }).catch(err => {
                            return Promise.reject(err);
                        });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refreshToken = getRefreshToken();
                    // console.log("refresh token :", refreshToken);


                    if (!refreshToken) {
                        throw new Error("Refresh token not available");
                    }

                    // console.log("Attempting to refresh token...");
                    const refreshTokenUrl = import.meta.env.VITE_REFRESH_TOKEN;

                    const response = await axios.post(
                        refreshTokenUrl,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${refreshToken}`
                            }
                        }
                    );

                    if (!response.data?.payload?.access_token) {
                        throw new Error("Invalid refresh token response");
                    }
                    // console.log("response refresh token :", response.data);

                    const token = response.data.payload.access_token;
                    const refresh_token = response.data.payload.refresh_token;

                    // console.log("New token received:", token.substring(0, 10) + "...");

                    localStorage.setItem('token', token);
                    document.cookie = `refresh_token=${refresh_token}; path=/; secure; samesite=strict`;

                    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                    originalRequest.headers.Authorization = `Bearer ${token}`;

                    processQueue(null, token);

                    return API(originalRequest);
                } catch (refreshError) {
                    console.error("Failed to refresh token:", refreshError);
                    processQueue(refreshError, null);

                    store.dispatch(updateUser({}));
                    store.dispatch(setActiveTab('view-home'));

                    localStorage.removeItem('token');
                    localStorage.removeItem('f7ReminderSystem');

                    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";

                    try {
                        const isBiometricAvailable = await BiometricAuth.isAvailable();
                        if (isBiometricAvailable) {
                            await BiometricAuth.deleteToken();
                        }
                    } catch (error) {
                        console.error("Failed to delete biometric token:", error);
                    }

                    f7.views.main.router.navigate('/login/', {
                        reloadCurrent: false,
                        replaceState: true,
                        clearPreviousHistory: true,
                    });

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
        }

        return Promise.reject(error);
    }
);