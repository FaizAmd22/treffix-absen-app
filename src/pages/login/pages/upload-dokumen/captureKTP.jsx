import { useEffect, useRef, useState } from 'react';
import { Page, f7, Preloader, Link } from 'framework7-react';
import { translate } from '../../../../utils/translate';
import { useSelector } from 'react-redux';
import { selectLanguages } from '../../../../slices/languagesSlice';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { showToastFailed } from '../../../../functions/toast';
import LoadingPopup from '../../../../components/loadingPopup';
import { GiPlainCircle } from 'react-icons/gi';
import { IoClose, IoCheckmark } from 'react-icons/io5';
import { API } from '../../../../api/axios';
import { ensureJpegUploadable } from '../../../../functions/dataUrlToFile';

const CaptureKTP = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [permissionStatus, setPermissionStatus] = useState('prompt');
    const [capturedImage, setCapturedImage] = useState(null);
    const [showLoading, setShowLoading] = useState(false);
    const language = useSelector(selectLanguages);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const detectionIntervalRef = useRef(null);
    const scanYRef = useRef(0);
    const dirRef = useRef(1);
    const lastTsRef = useRef(0);
    const [flash, setFlash] = useState(false);
    const [query, setQuery] = useState({});

    useEffect(() => {
        const params = f7.views.main.router.currentRoute.query;
        setQuery(params);
    }, []);

    const drawKTPBox = (ts) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;
        const valueType = query?.value || 'identity_card';

        const dpr = window.devicePixelRatio || 1;

        const rect = canvas.getBoundingClientRect();
        const cw = Math.round(rect.width);
        const ch = Math.round(rect.height);

        if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
            canvas.width = cw * dpr;
            canvas.height = ch * dpr;
        }

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cw, ch);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, cw, ch);

        const heightCaptureBox = valueType == "family_card" ? 0.707 : 0.63
        const boxWidth = cw * 0.85;
        const boxHeight = boxWidth * heightCaptureBox;
        const boxX = (cw - boxWidth) / 2;
        const boxY = (ch - boxHeight) / 2;
        const r = 15;

        const roundedPath = () => {
            ctx.beginPath();
            ctx.moveTo(boxX + r, boxY);
            ctx.lineTo(boxX + boxWidth - r, boxY);
            ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + r);
            ctx.lineTo(boxX + boxWidth, boxY + boxHeight - r);
            ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - r, boxY + boxHeight);
            ctx.lineTo(boxX + r, boxY + boxHeight);
            ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - r);
            ctx.lineTo(boxX, boxY + r);
            ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
            ctx.closePath();
        };

        ctx.globalCompositeOperation = 'destination-out';
        roundedPath(); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        ctx.lineWidth = 3;
        roundedPath(); ctx.stroke();

        if (ts === undefined) ts = performance.now();
        const dt = Math.min(40, ts - (lastTsRef.current || ts));
        lastTsRef.current = ts;

        const travel = boxHeight - 16;
        if (scanYRef.current <= 0) dirRef.current = 1;
        if (scanYRef.current >= travel) dirRef.current = -1;
        scanYRef.current += dirRef.current * dt * 0.22;

        const y = boxY + 8 + scanYRef.current;

        ctx.save();
        roundedPath();
        ctx.clip();

        const lineH = 10;
        const grad = ctx.createLinearGradient(0, y - lineH, 0, y + lineH);
        grad.addColorStop(0, 'rgba(47,107,255,0)');
        grad.addColorStop(0.5, 'rgba(47,107,255,0.75)');
        grad.addColorStop(1, 'rgba(47,107,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(boxX, y - lineH, boxWidth, lineH * 2);

        ctx.shadowColor = 'rgba(47,107,255,0.35)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(boxX, y, boxWidth, 2);

        ctx.restore();

        ctx.save();
        ctx.shadowColor = 'rgba(47,107,255,0.7)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#2F6BFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(boxX + 10, y);
        ctx.lineTo(boxX + boxWidth - 10, y);
        ctx.stroke();
        ctx.restore();

        const shadeGrad = ctx.createLinearGradient(0, boxY + boxHeight, 0, boxY + boxHeight + 120);
        // shadeGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
        shadeGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadeGrad;
        ctx.fillRect(boxX, boxY + boxHeight, boxWidth, 120);
    };

    const startLoop = () => {
        const detect = (ts) => {
            drawKTPBox(ts);
            detectionIntervalRef.current = requestAnimationFrame(detect);
        };
        detect();
    };

    const stopLoop = () => {
        if (detectionIntervalRef.current) cancelAnimationFrame(detectionIntervalRef.current);
    };

    const captureKTPImage = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !video.videoWidth) return;
        const valueType = query?.value || 'identity_card';

        try {
            const rect = canvas.getBoundingClientRect();
            const cw = rect.width;
            const ch = rect.height;
            const heightCaptureBox = valueType == "family_card" ? 0.707 : 0.63

            const boxWidth = cw * 0.85;
            const boxHeight = boxWidth * heightCaptureBox;
            const boxX = (cw - boxWidth) / 2;
            const boxY = (ch - boxHeight) / 2;

            const vw = video.videoWidth;
            const vh = video.videoHeight;
            const scale = Math.max(cw / vw, ch / vh);
            const displayW = vw * scale;
            const displayH = vh * scale;
            const offsetX = (cw - displayW) / 2;
            const offsetY = (ch - displayH) / 2;

            let sx = (boxX - offsetX) / scale;
            let sy = (boxY - offsetY) / scale;
            let sw = boxWidth / scale;
            let sh = boxHeight / scale;

            sx = Math.max(0, Math.min(vw, sx));
            sy = Math.max(0, Math.min(vh, sy));
            if (sx + sw > vw) sw = vw - sx;
            if (sy + sh > vh) sh = vh - sy;

            const MAX_SIDE = 1280;
            const outScale = Math.min(1, MAX_SIDE / Math.max(boxWidth, boxHeight));
            const outW = Math.round(sw);
            const outH = Math.round(sh);

            const temp = document.createElement('canvas');
            temp.width = outW;
            temp.height = outH;
            const tctx = temp.getContext('2d', { alpha: false, desynchronized: true });

            tctx.imageSmoothingEnabled = false;
            tctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);

            const dataURL = temp.toDataURL('image/jpeg', 1.0);

            setCapturedImage(dataURL);

            setFlash(true);
            setTimeout(() => setFlash(false), 120);
        } catch (err) {
            console.error('Capture error:', err);
        } finally {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            stopLoop();
        }
    };

    const handleCancelCapture = () => {
        setCapturedImage(null);

        const restartCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
                });

                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                startLoop();

                const detect = () => {
                    drawKTPBox();
                    detectionIntervalRef.current = requestAnimationFrame(detect);
                };
                detect();
            } catch (error) {
                showToastFailed(translate('failed_to_open_camera', language));
            }
        };

        restartCamera();
    };

    const handleConfirmCapture = async () => {
        setShowLoading(true);

        try {
            const labelName = query?.label || 'document';
            const valueType = query?.value || 'identity_card';

            const safeLabel = labelName.replace(/\s+/g, '_').toLowerCase();
            const filename = `${safeLabel}.jpg`;

            const out = await ensureJpegUploadable(capturedImage, filename, 0.9);

            const formData = new FormData();

            if (out.blob) {
                formData.append('file', out.blob, out.filename);
            } else if (out.file) {
                if (!out.file.size) {
                    const fallback = await ensureJpegUploadable(capturedImage, filename, 0.9);
                    formData.append('file', fallback.blob, fallback.filename);
                } else {
                    formData.append('file', out.file);
                }
            } else {
                throw new Error('No blob/file returned');
            }

            console.log("valueType :", valueType);

            formData.append('document_type', valueType);

            const response = await API.post('/mobile/employees/ocr-document', formData, {
                transformRequest: [(data) => data],
            });

            try {
                const payload = response?.data?.payload ?? null;
                if (payload) {
                    localStorage.setItem('dataOcr', JSON.stringify(payload));
                    localStorage.setItem('capturedImage', capturedImage)
                    localStorage.setItem('filename', filename)
                }
                else localStorage.removeItem('dataOcr');
            } catch (e) {
                console.warn('localStorage quota error:', e);
            }

            setShowLoading(false);
            const query2 = `?value=${encodeURIComponent(query.value)}&label=${encodeURIComponent(query.label)}`;

            f7.views.main.router.navigate(`/validation-ktp/${query2}`);
        } catch (error) {
            console.error(error);
            setShowLoading(false);
            showToastFailed(translate('failed_to_upload_file', language));
        }
    };

    const requestAllPermissions = () => {
        return new Promise(async (resolve, reject) => {
            try {
                setPermissionStatus('requesting_camera');
                const cameraPermission = await requestCameraPermission();

                if (!cameraPermission) {
                    reject(new Error(translate('camera_permission_denied', language)));
                    return;
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
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

    const requestCameraPermission = () => {
        return new Promise((resolve) => {
            if (!window.cordova || !cordova.plugins || !cordova.plugins.permissions) {
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

    const getPermissionStatusText = () => {
        switch (permissionStatus) {
            case 'requesting_location':
                return translate('requesting_location_permission', language);
            case 'requesting_camera':
                return translate('requesting_camera_permission', language);
            case 'granted':
                return translate('file_verification', language);
            default:
                return translate('requesting_permission', language);
        }
    };

    useEffect(() => {
        const initializeWorkflow = async () => {
            try {
                await requestAllPermissions();
                setIsLoading(false);

                const detect = () => {
                    drawKTPBox();
                    detectionIntervalRef.current = requestAnimationFrame(detect);
                };
                detect();
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
            stopLoop();
            if (detectionIntervalRef.current) {
                cancelAnimationFrame(detectionIntervalRef.current);
            }
        };
    }, []);

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

                {flash && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'white',
                        opacity: 0.85,
                        transition: 'opacity 120ms ease',
                        zIndex: 2000
                    }} />
                )}

                {capturedImage ? (
                    <img
                        src={capturedImage}
                        alt="Captured KTP"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            backgroundColor: '#000'
                        }}
                    />
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        <canvas
                            ref={canvasRef}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                        />
                    </>
                )}

                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "absolute",
                    zIndex: 999,
                    height: "100dvh",
                    color: 'white',
                    top: 0,
                    width: "100%"
                }}>
                    <div>
                        <Link back style={{ color: "white", paddingTop: "20px", paddingLeft: "10px" }}>
                            <IoIosArrowRoundBack size={"25px"} style={{ marginRight: "10px" }} />
                            <p style={{ fontSize: "var(--font-lg)", fontWeight: "600" }}>{query?.value == 'identity_card' ? translate('back_capture_ktp', language) : translate('back_capture_document', language)}</p>
                        </Link>

                        <p style={{
                            textAlign: 'center',
                            width: '100%',
                            fontSize: 20,
                            fontWeight: 700,
                            marginTop: 100
                        }}>
                            {(!capturedImage && query?.value == 'identity_card') && translate('take_id_card_photo', language)}
                            {(!capturedImage && query?.value != 'identity_card') && translate('take_file_photo', language)}
                        </p>

                        <p style={{
                            textAlign: 'center',
                            position: "absolute",
                            bottom: 0,
                            width: '90%',
                            fontSize: '16px',
                            fontWeight: 400,
                            marginBottom: "120px",
                            padding: '0 20px',
                            color: "white"
                        }}>
                            {(!capturedImage && query?.value == 'identity_card') && translate('take_id_card_photo_text', language)}
                            {(!capturedImage && query?.value != 'identity_card') && translate('take_file_photo_text', language)}
                        </p>
                    </div>
                </div>

                {!capturedImage ? (
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        paddingBottom: '30px',
                        zIndex: 1000
                    }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                background: "rgba(0,0,0,0)",
                                border: "5px solid rgba(255,255,255,0.3)",
                                borderRadius: "100%",
                                padding: "3px",
                                cursor: 'pointer'
                            }}
                            onClick={captureKTPImage}
                        >
                            <GiPlainCircle
                                style={{
                                    color: "white",
                                    opacity: 1,
                                    transition: 'all 0.3s ease'
                                }}
                                size={55}
                            />
                        </div>
                    </div>
                ) : (
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '180px',
                        paddingBottom: '30px',
                        zIndex: 1000
                    }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                background: "rgba(0, 0, 0, 0.25)",
                                borderRadius: "100%",
                                padding: "15px",
                                cursor: 'pointer',
                                width: '50px',
                                height: '50px'
                            }}
                            onClick={handleCancelCapture}
                        >
                            <IoClose
                                style={{
                                    color: "var(--color-red)"
                                }}
                                size={40}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                background: "rgba(0, 0, 0, 0.25)",
                                borderRadius: "100%",
                                padding: "15px",
                                cursor: 'pointer',
                                width: '50px',
                                height: '50px'
                            }}
                            onClick={handleConfirmCapture}
                        >
                            <IoCheckmark
                                style={{
                                    color: "var(--color-green)"
                                }}
                                size={40}
                            />
                        </div>
                    </div>
                )}
            </div>

            <LoadingPopup popupOpened={showLoading} setPopupOpened={setShowLoading} />
        </Page>
    );
};

export default CaptureKTP;