import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Page, Navbar, Block, Button, f7, Link, Popup } from 'framework7-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useDispatch, useSelector } from 'react-redux';
import { API } from '../../../api/axios';
import { IoIosArrowRoundBack, IoMdClose } from 'react-icons/io';
import { selectSettings } from '../../../slices/settingsSlice';
import TrainingPopup from './trainingPopup';
import { selectTest, updateTest } from '../../../slices/testSlice';
import { translate } from '../../../utils/translate';
import { selectLanguages } from '../../../slices/languagesSlice';
import { showToastFailed } from '../../../functions/toast';
import MessageAlert from '../../../components/messageAlert';
import ImageAlertLight from '../../../assets/messageAlert/training-light.png'
import ImageAlertDark from '../../../assets/messageAlert/training-dark.png'

const ScanQRPage = () => {
    const scannerRef = useRef(null);
    const [isLoadingPopup, setIsLoadingPopup] = useState(false);
    const [popupOpened, setPopupOpened] = useState(false);
    const [sessionCode, setSessionCode] = useState(null);
    const [qrDetected, setQrDetected] = useState(false);
    const [sheetOpened, setSheetOpened] = useState(false);
    const dispatch = useDispatch();
    const token = localStorage.getItem('token');
    const theme = useSelector(selectSettings)
    const typeTest = useSelector(selectTest)
    const language = useSelector(selectLanguages)

    const getUserCoordinates = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error(translate('training_geolocation_not_supported', language)));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve([position.coords.longitude, position.coords.latitude]);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    resolve([]);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    };

    const requestAndroidPermissions = () => {
        return new Promise((resolve, reject) => {
            if (!window.cordova || !cordova.plugins || !cordova.plugins.permissions) {
                resolve(true);
                return;
            }

            const permissions = cordova.plugins.permissions;
            const requiredPermissions = [
                permissions.CAMERA,
                permissions.ACCESS_FINE_LOCATION
            ];

            const checkPermissions = () => {
                permissions.requestPermissions(
                    requiredPermissions,
                    (status) => {
                        if (status.hasPermission) {
                            resolve(true);
                        } else {
                            reject(new Error(translate('permissions_not_granted', language)));
                        }
                    },
                    () => {
                        reject(new Error(translate('permissions_request_failed', language)));
                    }
                );
            };

            permissions.hasPermission(
                requiredPermissions,
                (status) => {
                    if (status.hasPermission) {
                        resolve(true);
                    } else {
                        checkPermissions();
                    }
                },
                () => {
                    reject(new Error(translate('permission_check_failed', language)));
                }
            );
        });
    };

    const qrboxSize = useMemo(() => {
        return Math.min(window.innerWidth, window.innerHeight) * 0.8;
    }, []);

    const startScanner = async () => {
        try {
            await requestAndroidPermissions();

            const devices = await Html5Qrcode.getCameras();
            if (!devices || devices.length === 0) {
                throw new Error("No camera found on device.");
            }

            const backCamera = devices.find(device =>
                device.label.toLowerCase().includes("back") ||
                device.label.toLowerCase().includes("rear")
            ) || devices[0];

            const html5QrCode = new Html5Qrcode("qr-reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { deviceId: { exact: backCamera.id } },
                {
                    fps: 10,
                    qrbox: { width: qrboxSize, height: qrboxSize },
                    aspectRatio: window.innerWidth / window.innerHeight,
                    disableFlip: false
                },
                async (decodedText) => {
                    setQrDetected(true);
                    stopScanner();
                    try {
                        setIsLoadingPopup(true);
                        setSessionCode(decodedText);
                        localStorage.setItem("sessionCode", decodedText)
                        setPopupOpened(true);
                    } catch (error) {
                        console.error("Error after scanning:", error);
                        // f7.dialog.alert(translate('training_scan_failed', language));
                        showToastFailed(translate('training_scan_failed', language))
                    }
                },
                (errorMessage) => {
                    setQrDetected(false);
                }
            );
        } catch (err) {
            console.error("Tidak dapat memulai scanner:", err);
            // f7.dialog.alert("Kamera tidak dapat diakses atau sedang digunakan oleh aplikasi lain.");
            showToastFailed("Kamera tidak dapat diakses atau sedang digunakan oleh aplikasi lain.")
        }
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop()
                .then(() => {
                    scannerRef.current.clear();
                })
                .catch(err => {
                    console.error("Tidak dapat menghentikan scanner:", err);
                });
        }
    };

    const handleConfirm = async () => {
        setPopupOpened(false);
        setIsLoadingPopup(true);

        try {
            const coordinates = await getUserCoordinates();

            if (!sessionCode) {
                throw new Error(translate('training_session_code_not_available', language));
            }

            await fetchStartTest(sessionCode, coordinates);
        } catch (error) {
            console.error("Gagal memulai test:", error);
            // f7.dialog.alert(translate('training_failed_start_test', language));
            showToastFailed(translate('training_failed_start_test', language))
        } finally {
            setIsLoadingPopup(false);
        }
    };

    const fetchStartTest = async (sessionCode, coordinates) => {
        const id = f7.views.main.router.currentRoute.params.id;

        try {
            const response = await API.post(`/user-developments/${id}/offline/check`, {
                coordinates: coordinates,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Session-Code': sessionCode,
                },
            });

            setIsLoadingPopup(false);
            console.log("fetch offline check :", response);
            if (!response.data.payload.test_type) {
                // f7.dialog.create({
                //     text: translate('training_checkin_success', language),
                //     buttons: [
                //         {
                //             text: 'OK',
                //             onClick: function () {
                //                 f7.views.main.router.back();
                //             }
                //         }
                //     ],
                //     destroyOnClose: true
                // }).open();
                f7.views.main.router.back();
                setSheetOpened(true)
            } else {
                fetchQuestion();
            }
        } catch (error) {
            console.error("Data tidak bisa diakses", error);
            // f7.dialog.create({
            //     title: 'Error',
            //     text: translate('training_qr_not_valid', language),
            //     buttons: [
            //         {
            //             text: 'OK',
            //             onClick: function () {
            //                 f7.views.main.router.back();
            //             }
            //         }
            //     ],
            //     destroyOnClose: true
            // }).open();
            f7.views.main.router.back();
            showToastFailed(translate('training_qr_not_valid', language))
        } finally {
            setIsLoadingPopup(false);
        }
    };

    const fetchQuestion = async () => {
        const id = f7.views.main.router.currentRoute.params.id;
        setIsLoadingPopup(true);
        try {
            const response = await API.get(`/user-developments/${id}/offline/details`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Session-Code': sessionCode,
                }
            });

            const payload = response.data.payload;
            console.log("Response Payload:", payload);

            if (payload.step === "pre_test") {
                console.log("Navigating to /question/${id}/");
                dispatch(updateTest("pre-test"));
                f7.views.main.router.navigate(`/question/${id}/`, { clearPreviousHistory: true, });
            } else if (payload.step === "video_learning") {
                console.log("Navigating to /video-learning/${id}/");
                f7.views.main.router.navigate(`/video-learning/${id}/`, { clearPreviousHistory: true, });
            } else {
                console.log("Navigating to /question/${id}/");
                dispatch(updateTest("post-test"));
                f7.views.main.router.navigate(`/question/${id}/`, { clearPreviousHistory: true, });
            }
        } catch (error) {
            console.error("Error in fetchQuestion:", error);
            // f7.dialog.create({
            //     title: 'Error',
            //     text: translate('training_qr_not_valid', language),
            //     buttons: [
            //         {
            //             text: 'OK',
            //             onClick: function () {
            //                 f7.views.main.router.back();
            //             }
            //         }
            //     ],
            //     destroyOnClose: true
            // }).open();
            f7.views.main.router.back();
            showToastFailed(translate('training_qr_not_valid', language))
        } finally {
            setIsLoadingPopup(false);
        }
    };

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            #qr-reader video {
                width: 100vw !important;
                height: 100vh !important;
                object-fit: cover !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
            }
            #qr-reader__dashboard {
                display: none !important;
            }
            #qr-reader__scan_region {
                width: 100% !important;
                height: 100% !important;
            }
        `;
        document.head.appendChild(style);

        const timer = setTimeout(() => {
            startScanner();
        }, 1000);

        return () => {
            clearTimeout(timer);
            document.head.removeChild(style);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    return (
        <Page style={{ padding: 0, margin: 0 }}>
            <Link back style={{
                color: "white",
                position: "fixed",
                top: 20,
                left: 15,
                zIndex: 1001,
                padding: '8px'
            }}>
                <IoIosArrowRoundBack size={"25px"} style={{ marginRight: "10px" }} />
                <p style={{ fontSize: "var(--font-lg)", fontWeight: 700 }}>Scan QR</p>
            </Link>

            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                background: '#000'
            }}>
                <div id="qr-reader" style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1
                }}></div>

                <div style={{
                    position: 'absolute',
                    top: 110,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    color: qrDetected ? 'var(--color-green)' : 'var(--color-red)',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    zIndex: 11,
                    padding: '0 20px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    transition: 'color 0.3s ease'
                }}>
                    {qrDetected
                        ? (translate('qr_code_detected', language) || 'QR Code Terdeteksi')
                        : (translate('qr_code_not_detected', language) || 'QR Code Tidak Terdeteksi')
                    }
                </div>

                {isLoadingPopup && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'rgba(0, 0, 0)',
                        zIndex: 1000
                    }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>
                            <div className="preloader color-white"></div>
                            <p>{translate('training_processing', language)}</p>
                        </div>
                    </div>
                )}
            </div>

            <TrainingPopup
                theme={theme}
                popupOpened={popupOpened}
                setPopupOpened={setPopupOpened}
                handleConfirm={handleConfirm}
                title={translate('start_training', language)}
                desc={`${translate('training_desc_start_test1', language)} ${typeTest == "pre-test" ? "Pre-Test" : "Post-Test"} ${translate('training_desc_start_test2', language)}`}
                btnYes={translate('start', language)}
                btnNo={translate('training_cancel', language)}
                needBack={true}
            />

            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={translate('checkin_training_offline', language)}
                message={translate('checkin_training_offline_text', language)}
                imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
            />
        </Page>
    );
};

export default ScanQRPage;