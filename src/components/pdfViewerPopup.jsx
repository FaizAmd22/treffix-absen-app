import React, { useState, useEffect } from 'react';
import { Block, Button, Popup, Preloader } from 'framework7-react';
import { IoMdClose } from 'react-icons/io';

const PdfViewerPopup = ({ opened, onClose, pdfSrc }) => {
    const [loading, setLoading] = useState(true);
    const [pdfObjectUrl, setPdfObjectUrl] = useState(null);
    const [downloadError, setDownloadError] = useState(null);

    useEffect(() => {
        if (opened && pdfSrc) {
            downloadPdf();
        }

        return () => {
            if (pdfObjectUrl) {
                URL.revokeObjectURL(pdfObjectUrl);
                setPdfObjectUrl(null);
            }
        };
    }, [opened, pdfSrc]);

    const downloadPdf = async () => {
        if (!pdfSrc) return;

        setLoading(true);
        setDownloadError(null);

        try {
            const response = await fetch(pdfSrc);

            if (!response.ok) {
                throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
            }

            const pdfBlob = await response.blob();
            const objectUrl = URL.createObjectURL(pdfBlob);

            setPdfObjectUrl(objectUrl);
            setLoading(false);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            setDownloadError(error.message);
            setLoading(false);
        }
    };

    return (
        <Popup
            opened={opened}
            onPopupClose={onClose}
            style={{
                display: opened ? "flex" : "none",
                justifyContent: "center",
                alignItems: "center",
                background: "white"
            }}
        >
            <Block style={{ padding: "0", margin: "0", width: "100%", height: "100%" }}>
                <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10 }}>
                    <Button onClick={onClose} style={{ background: "transparent", border: "none", color: "black" }}>
                        <IoMdClose size={"20px"} />
                    </Button>
                </div>

                {loading && (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        width: "100%"
                    }}>
                        <Preloader size={50} color="blue" />
                        <p style={{ marginTop: "20px", color: "#666" }}>Mengunduh PDF...</p>
                    </div>
                )}

                {downloadError && (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        padding: "20px",
                        textAlign: "center"
                    }}>
                        <div style={{ color: "red", marginBottom: "15px" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <p style={{ color: "#666" }}>Gagal memuat PDF</p>
                        <p style={{ color: "#999", fontSize: "14px" }}>{downloadError}</p>
                        <Button
                            onClick={downloadPdf}
                            style={{ marginTop: "15px", textTransform: "capitalize" }}
                        >
                            Coba Lagi
                        </Button>
                    </div>
                )}

                {!loading && !downloadError && pdfObjectUrl && (
                    <iframe
                        src={`${pdfObjectUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                        title="PDF Viewer"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                        }}
                    />
                )}
            </Block>
        </Popup>
    );
};

export default PdfViewerPopup;