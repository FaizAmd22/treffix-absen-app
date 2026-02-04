import { useEffect, useRef, useState, useCallback } from "react";
import { f7 } from "framework7-react";

/* eslint-disable no-undef */
// Jika CameraPreview ada di global (dari plugin Cordova), kita pakai langsung.

export default function CameraWithFrame(props) {
    const {
        onCropped,                              // (blob, dataUrl) => void
        pictureSize = { width: 1920, height: 1080 },
        frameAspect = 210 / 297,               // A4 portrait sebagai default
    } = props || {};

    const overlayRef = useRef(null);
    const [started, setStarted] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    // Start camera on mount, stop on unmount
    useEffect(() => {
        let unmounted = false;

        const start = () => {
            try {
                CameraPreview.startCamera(
                    {
                        x: 0,
                        y: 0,
                        width: window.innerWidth,
                        height: window.innerHeight,
                        camera: "rear",
                        toBack: true,
                        previewDrag: false,
                        tapPhoto: false,
                        disableExifHeaderStripping: false,
                    },
                    () => {
                        if (unmounted) return;
                        try {
                            // Android: continuous focus jika tersedia
                            CameraPreview.setFocusMode && CameraPreview.setFocusMode("continuous-picture");
                        } catch (e) { }
                        setStarted(true);
                    },
                    (err) => {
                        if (unmounted) return;
                        setError(typeof err === "string" ? err : "Gagal menyalakan kamera");
                    }
                );
            } catch (e) {
                setError(e && e.message ? e.message : "Tidak bisa akses kamera");
            }
        };

        start();

        return () => {
            unmounted = true;
            try {
                CameraPreview.stopCamera && CameraPreview.stopCamera();
            } catch (e) { }
        };
    }, []);

    // Tap-to-focus: kirim posisi tap (px layar) ke plugin
    const handleTap = useCallback((e) => {
        try {
            CameraPreview.tapToFocus &&
                CameraPreview.tapToFocus(
                    { x: e.clientX, y: e.clientY },
                    () => { },
                    () => { }
                );
        } catch (err) { }
    }, []);

    // Ambil foto mentah (base64) dari plugin
    const takePicture = useCallback(() => {
        return new Promise((resolve, reject) => {
            CameraPreview.takePicture(
                {
                    width: pictureSize.width,
                    height: pictureSize.height,
                    quality: 100,
                },
                (imgDataBase64) => resolve(imgDataBase64),
                (err) => reject(err)
            );
        });
    }, [pictureSize.width, pictureSize.height]);

    // Capture + crop sesuai bingkai overlay
    const captureAndCrop = useCallback(async () => {
        if (!overlayRef.current || busy) return;
        setBusy(true);
        setError(null);
        try {
            const base64 = await takePicture();

            const screenW = window.innerWidth;
            const screenH = window.innerHeight;
            const picW = pictureSize.width;
            const picH = pictureSize.height;

            // Skala layar → piksel foto
            const scaleX = picW / screenW;
            const scaleY = picH / screenH;

            const oRect = overlayRef.current.getBoundingClientRect();

            const sx = Math.max(0, Math.round(oRect.left * scaleX));
            const sy = Math.max(0, Math.round(oRect.top * scaleY));
            const sw = Math.min(picW - sx, Math.round(oRect.width * scaleX));
            const sh = Math.min(picH - sy, Math.round(oRect.height * scaleY));

            // Render & crop pakai canvas
            const img = new Image();
            img.src = `data:image/jpeg;base64,${base64}`;
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
            });

            const canvas = document.createElement("canvas");
            canvas.width = sw;
            canvas.height = sh;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

            const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
            const blob = await new Promise((resolve) =>
                canvas.toBlob((b) => resolve(b), "image/jpeg", 1.0)
            );

            onCropped && onCropped(blob, dataUrl);
            return { blob, dataUrl };
        } catch (e) {
            setError(e && e.message ? e.message : "Gagal capture/crop");
            f7.dialog.alert("Gagal mengambil gambar. Coba lagi ya.");
        } finally {
            setBusy(false);
        }
    }, [busy, onCropped, pictureSize.width, pictureSize.height, takePicture]);

    return (
        <div
            className="fixed inset-0 z-[1] text-white"
            onClick={handleTap} // tap-to-focus
        >
            {/* Overlay UI (WebView di atas; kamera di belakang via toBack:true) */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Mask gelap + bingkai */}
                <div className="absolute inset-0">
                    <div
                        ref={overlayRef}
                        className="
              absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              w-[84vw] max-w-[680px]
            "
                        style={{
                            aspectRatio: String(frameAspect),
                            border: "4px solid rgba(255,255,255,0.95)",
                            borderRadius: "16px",
                            boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                            outline: "1px solid rgba(255,255,255,0.3)",
                        }}
                    />
                </div>

                {/* Header/help text */}
                <div className="absolute top-6 w-full text-center px-4">
                    <div className="inline-block bg-black/45 px-3 py-1 rounded-lg text-sm">
                        Posisikan dokumen pas di dalam bingkai
                    </div>
                </div>

                {/* Tombol bawah (pointer-events aktif supaya bisa diklik) */}
                <div className="absolute bottom-6 w-full flex items-center justify-center gap-3 pointer-events-auto">
                    <button
                        disabled={!started || busy}
                        onClick={captureAndCrop}
                        className="px-5 py-3 rounded-full bg-white text-black font-semibold disabled:opacity-60"
                    >
                        {busy ? "Memproses…" : "Capture"}
                    </button>
                </div>
            </div>

            {/* Error bubble */}
            {error && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded">
                    {error}
                </div>
            )}
        </div>
    );
}
