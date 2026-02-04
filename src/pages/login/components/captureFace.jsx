import React, { useEffect, useRef, useState } from 'react';
import { Page, f7, Preloader, Link } from 'framework7-react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';
import { translate } from '../../../utils/translate';
import { useSelector } from 'react-redux';
import { selectLanguages } from '../../../slices/languagesSlice';
import { base64ToBlob, sendFaceRegister } from '../../../functions/faceRegister';
import { selectUser } from '../../../slices/userSlice';
import { API, APIFaceRecog } from '../../../api/axios';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { compressImage } from '../../../functions/compressImage';
import { showToast, showToastFailed } from '../../../functions/toast';
import { selectSettings } from '../../../slices/settingsSlice';
import LoadingPopup from '../../../components/loadingPopup';
import MessageAlert from '../../../components/messageAlert';
import ImageAlertLight from '../../../assets/messageAlert/overtime-in-light.png'
import ImageAlertDark from '../../../assets/messageAlert/overtime-in-dark.png'
import ImageAlertLight2 from '../../../assets/messageAlert/overtime-out-light.png'
import ImageAlertDark2 from '../../../assets/messageAlert/overtime-out-dark.png'

const CaptureFace = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [permissionStatus, setPermissionStatus] = useState('prompt');
    const [captureStatus, setCaptureStatus] = useState('');
    const [capturedImages, setCapturedImages] = useState([]);
    const [captureProgress, setCaptureProgress] = useState(0);
    const [isCaptureComplete, setIsCaptureComplete] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [attendanceType, setAttendanceType] = useState(null);
    const [overtimeIn, setOvertimeIn] = useState(null);
    const [overtimeOut, setOvertimeOut] = useState(null);
    const [sheetOpened, setSheetOpened] = useState(false);
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const selectedUser = useSelector(selectUser)

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const cameraRef = useRef(null);
    const captureStateRef = useRef({
        isCapturing: false,
        captureCount: 0,
        totalCaptures: 3,
        timeoutId: null,
        captureInterval: 1000,
        isFaceInCircle: false,
        captureStarted: false
    });

    console.log("capturedImages :", capturedImages);
    console.log("userLocation :", userLocation);

    const captureFace = () => {
        if (!captureStateRef.current.isFaceInCircle) {
            return;
        }

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg');

        setCapturedImages(prev => [...prev, imageData]);

        captureStateRef.current.captureCount++;
        setCaptureProgress(captureStateRef.current.captureCount);

        setCaptureStatus(`Tunggu sebentar hingga ${captureStateRef.current.totalCaptures - captureStateRef.current.captureCount} detik`);

        if (captureStateRef.current.captureCount >= captureStateRef.current.totalCaptures) {
            setIsCaptureComplete(true);
            setCaptureStatus('Capture complete!');
            captureStateRef.current.isCapturing = false;

            if (cameraRef.current) {
                cameraRef.current.stop();
                streamRef.current?.getTracks().forEach((track) => track.stop());
            }

            console.log('Captured images:', capturedImages);
        } else {
            captureStateRef.current.timeoutId = setTimeout(() => {
                if (captureStateRef.current.isCapturing) {
                    captureFace();
                }
            }, captureStateRef.current.captureInterval);
        }
    };

    const startCapture = () => {
        captureStateRef.current.captureCount = 0;
        captureStateRef.current.isCapturing = true;
        captureStateRef.current.captureStarted = true;
        setCapturedImages([]);
        setCaptureProgress(0);
        setIsCaptureComplete(false);

        setCaptureStatus(`Tunggu sebentar hingga ${captureStateRef.current.totalCaptures - captureProgress} detik`);
        setTimeout(() => {
            captureFace();
        }, 2000);
    };

    const checkFaceInCircle = (landmarks, centerX, centerY, radius, canvas) => {
        for (let point of landmarks) {
            const x = point.x * canvas.width;
            const y = point.y * canvas.height;
            const dx = (x - centerX) / radius;
            const dy = (y - centerY) / radius;
            if (dx * dx + dy * dy > 1) {
                return false;
            }
        }
        return true;
    };

    const initializeFaceMesh = async () => {
        const faceMesh = new FaceMesh({
            locateFile: (file) => `/mediapipe/face_mesh/${file}`
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
        });

        await faceMesh.initialize();

        faceMesh.onResults((results) => {
            if (isLoading) setIsLoading(false);

            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (!video || !canvas) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) * 0.45;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';

            const isFaceDetected = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
            let faceFullyInside = false;

            if (isFaceDetected) {
                const landmarks = results.multiFaceLandmarks[0];
                faceFullyInside = checkFaceInCircle(landmarks, centerX, centerY, radius, canvas);

                drawConnectors(ctx, landmarks, FaceMesh.TESSELATION);

                captureStateRef.current.isFaceInCircle = faceFullyInside;

                if (faceFullyInside && !captureStateRef.current.captureStarted && !isCaptureComplete) {
                    startCapture();
                }
                if (!faceFullyInside && captureStateRef.current.captureStarted && !isCaptureComplete) {
                    captureStateRef.current.captureStarted = false;
                    captureStateRef.current.isCapturing = false;
                }
            }

            ctx.strokeStyle = isFaceDetected && faceFullyInside ? 'green' : 'red';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();

            if (!isCaptureComplete) {
                if (!isFaceDetected || !faceFullyInside) {
                    setCaptureStatus(translate('face_recognize_face_position_in', language));
                } else if (!captureStateRef.current.captureStarted) {
                    setCaptureStatus(translate('face_recognize_face_in', language));
                }
            }
        });

        const camera = new Camera(videoRef.current, {
            onFrame: async () => await faceMesh.send({ image: videoRef.current }),
            width: 1280,
            height: 720,
        });

        camera.start();
        cameraRef.current = camera;
    };

    // Fixed: Sequential permission requests
    const requestAllPermissions = () => {
        return new Promise(async (resolve, reject) => {
            try {
                // Step 1: Request Location Permission First
                setPermissionStatus('requesting_location');
                const locationPermission = await requestLocationPermission();

                if (!locationPermission) {
                    reject(new Error(translate('location_permission_denied', language)));
                    return;
                }

                // Step 2: Get Location
                const location = await getCurrentLocation();
                setUserLocation(location);

                // Step 3: Request Camera Permission
                setPermissionStatus('requesting_camera');
                const cameraPermission = await requestCameraPermission();

                if (!cameraPermission) {
                    reject(new Error(translate('camera_permission_denied', language)));
                    return;
                }

                // Step 4: Get Camera Stream
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: 1280, height: 720 }
                });

                setPermissionStatus('granted');
                videoRef.current.srcObject = stream;
                streamRef.current = stream;

                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    };

    const requestLocationPermission = () => {
        return new Promise((resolve) => {
            if (!window.cordova || !cordova.plugins || !cordova.plugins.permissions) {
                // For web browser
                resolve(true);
                return;
            }

            const permissions = cordova.plugins.permissions;

            permissions.hasPermission(
                permissions.ACCESS_FINE_LOCATION,
                (status) => {
                    if (status.hasPermission) {
                        resolve(true);
                    } else {
                        permissions.requestPermission(
                            permissions.ACCESS_FINE_LOCATION,
                            (result) => resolve(result.hasPermission),
                            () => resolve(false)
                        );
                    }
                },
                () => resolve(false)
            );
        });
    };

    const requestCameraPermission = () => {
        return new Promise((resolve) => {
            if (!window.cordova || !cordova.plugins || !cordova.plugins.permissions) {
                // For web browser - permission handled by getUserMedia
                resolve(true);
                return;
            }

            const permissions = cordova.plugins.permissions;

            permissions.hasPermission(
                permissions.CAMERA,
                (status) => {
                    if (status.hasPermission) {
                        resolve(true);
                    } else {
                        permissions.requestPermission(
                            permissions.CAMERA,
                            (result) => resolve(result.hasPermission),
                            () => resolve(false)
                        );
                    }
                },
                () => resolve(false)
            );
        });
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(new Error('Location access denied'));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    };

    const fetchOvertimeTime = async () => {
        try {
            const response = await API.get("/mobile/attendances/overtime-today");

            console.log("fetch Overtime time :", response.data.payload);
            const data = response.data.payload

            setOvertimeIn(data.clock_in)
            setOvertimeOut(data.clock_out)
        } catch (error) {
            console.log("Data options tidak bisa diakses", error);
        }
    };

    const getPermissionStatusText = () => {
        switch (permissionStatus) {
            case 'requesting_location':
                return translate('requesting_location_permission', language);
            case 'requesting_camera':
                return translate('requesting_camera_permission', language);
            case 'granted':
                return translate('face_recognize_prepare_camera', language);
            default:
                return 'Meminta izin...';
        }
    };

    useEffect(() => {
        const initializeWorkflow = async () => {
            try {
                // Fetch overtime data first
                await fetchOvertimeTime();

                // Request all permissions sequentially
                await requestAllPermissions();

                // Initialize face mesh after permissions granted
                initializeFaceMesh();
            } catch (error) {
                setIsLoading(false);
                setPermissionStatus('denied');
                f7.views.main.router.back();
                showToastFailed(error.message || translate('permissions_denied', language));
            }
        };

        initializeWorkflow();

        return () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    useEffect(() => {
        const overtimeComplete = overtimeIn && overtimeOut
        if (!overtimeIn || overtimeComplete) {
            setAttendanceType('overtimein');
        } else {
            setAttendanceType('overtimeout');
        }
        console.log("overtimeIn :", overtimeIn);

    }, [overtimeIn]);

    useEffect(() => {
        if (isCaptureComplete) {
            setCaptureStatus(translate('face_recognize_completed', language))
            setShowLoading(true)
            setTimeout(() => {
                const { type } = f7.views.main.router.currentRoute.params;
                if (type == "register") {
                    try {
                        const register = async () => {
                            const base64Image = capturedImages[1];
                            const imageBlob = base64ToBlob(base64Image);

                            const result = await sendFaceRegister(imageBlob, "capture.jpeg");

                            console.log('Face register berhasil:', result);
                            setShowLoading(false)

                            try {
                                await API.put('/mobile/employees/onboarding/steps', { step: "face_register" })
                                f7.views.main.router.navigate('/jobdesc/', { clearPreviousHistory: true })
                            } catch (error) {
                                showToastFailed('Gagal ke tahap selanjutnya!')
                            }
                        }
                        register()
                    } catch (error) {
                        setShowLoading(false)
                        console.error('Error saat face register:', error);
                        f7.views.main.router.navigate('/login/', { clearPreviousHistory: true })
                        showToastFailed(translate('attendance_submission_failed', language))
                    }
                } else if (type == "overtime") {
                    const submitOvertime = async () => {
                        const requestBody = {
                            employee_id: selectedUser.employee_id,
                            coordinate: {
                                latitude: String(userLocation.lat),
                                longitude: String(userLocation.lng),
                            },
                            timestamp: new Date().toISOString(),
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            attendance_type: attendanceType,
                            picture: capturedImages[1].substring(23),
                            notes: null,
                        };

                        try {
                            const authKey = import.meta.env.VITE_AUTH_KEY;
                            await APIFaceRecog.post("/attendances/record", requestBody, {
                                headers: {
                                    Authorization: `Bearer ${authKey}`,
                                }
                            });

                            setShowLoading(false)
                            f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
                            setSheetOpened(true)
                        } catch (error) {
                            setShowLoading(false)
                            console.error('Attendance submission error:', error);
                            f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
                            showToastFailed(translate('attendance_submission_failed', language))
                        }
                    }

                    submitOvertime()
                } else {
                    setShowLoading(false)
                    f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
                    showToast(translate("test berhasil!"))
                }
            }, 1000);
        }
    }, [isCaptureComplete])

    const backToHome = () => {
        try {
            if (captureStateRef.current.timeoutId) {
                clearTimeout(captureStateRef.current.timeoutId);
                captureStateRef.current.timeoutId = null;
            }

            captureStateRef.current = {
                isCapturing: false,
                captureCount: 0,
                totalCaptures: 3,
                timeoutId: null,
                captureInterval: 1000,
                isFaceInCircle: false,
                captureStarted: false
            };

            if (cameraRef.current) {
                cameraRef.current.stop();
                cameraRef.current = null;
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => {
                    track.stop();
                });
                streamRef.current = null;
            }

            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject = null;
            }

            setCapturedImages([]);
            setCaptureProgress(0);
            setIsCaptureComplete(false);
            setCaptureStatus('');
            setIsLoading(false);
            setShowLoading(false);

            f7.dialog.close();

            const { type } = f7.views.main.router.currentRoute.params;

            if (type === "register") {
                f7.views.main.router.navigate('/login/', {
                    clearPreviousHistory: true,
                });
            } else {
                f7.views.main.router.navigate('/home/', {
                    clearPreviousHistory: true,
                });
            }

        } catch (error) {
            console.error('Error in backToHome:', error);

            f7.views.main.router.navigate('/home/', {
                clearPreviousHistory: true,
            });
        }
    };

    return (
        <Page>
            <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: "hidden" }}>
                {isLoading && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        height: "100vh"
                    }}>
                        <Preloader color="white" size={50} />
                        <p style={{ color: 'white', marginTop: 20, fontSize: 16 }}>
                            {getPermissionStatusText()}
                        </p>
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />

                <canvas
                    ref={canvasRef}
                    style={{ position: 'absolute', top: -10, left: 0, width: '100%', height: '102%', zIndex: 1 }}
                />

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", position: "absolute", zIndex: 999, height: "100dvh", color: 'white', top: 0, width: "100%" }}>
                    <div>
                        <Link onClick={backToHome} style={{ color: "white", paddingTop: "20px", paddingLeft: "10px" }}>
                            <IoIosArrowRoundBack size={"25px"} style={{ marginRight: "10px" }} />
                            <p style={{ fontSize: "var(--font-lg)", fontWeight: "600" }}>{translate('overtime_face_verification', language)}</p>
                        </Link>

                        <p style={{
                            textAlign: 'center',
                            width: '100%',
                            fontSize: 20,
                            fontWeight: 700,
                        }}>
                            {translate('face_recognize_hold_upright', language)}
                        </p>
                    </div>

                    <p style={{
                        textAlign: 'center',
                        width: '100%',
                        fontSize: '16px',
                        fontWeight: 400,
                        marginBottom: "30px",
                    }}>
                        {captureStatus}
                    </p>
                </div>
            </div>

            <LoadingPopup popupOpened={showLoading} setPopupOpened={setShowLoading} />
            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={attendanceType == "overtimein" ? translate('overtimein_success', language) : translate('overtimeout_success', language)}
                message={attendanceType == "overtimein" ? translate('overtimein_success_text', language) : translate('overtimeout_success_text', language)}
                imageAlert={theme == "light" && attendanceType == "overtimein" ? ImageAlertLight : theme == "dark" && attendanceType == "overtimein" ? ImageAlertDark : theme == "light" && attendanceType != "overtimein" ? ImageAlertLight2 : ImageAlertDark2}
                btnCloseText={translate('close', language)}
            />
        </Page>
    );
};

export default CaptureFace;