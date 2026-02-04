import React, { useState, useEffect, useRef } from 'react';
import { f7, Sheet, Navbar, Preloader } from 'framework7-react';
import { LuRotateCw, LuZoomIn, LuZoomOut } from 'react-icons/lu';

export const PdfViewer = ({ pdfUrl, title, isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const iframeRef = useRef(null);

    useEffect(() => {
        if (isOpen && pdfUrl) {
            setIsLoading(true);
            setError(null);
        }
        if (!pdfUrl) {
            setIsLoading(false);
            setError(null);
        }
    }, [isOpen, pdfUrl]);

    const handleDownload = async () => {
        try {
            // kalau sudah blob:, tidak perlu fetch ulang
            if (isBlobUrl(pdfUrl)) {
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = title || 'document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                f7.toast.show({
                    text: 'PDF downloaded successfully',
                    position: 'center',
                    closeTimeout: 2000,
                });
                return;
            }

            // kalau URL biasa, fetch dulu lalu download
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = title || 'document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            f7.toast.show({
                text: 'PDF downloaded successfully',
                position: 'center',
                closeTimeout: 2000,
            });
        } catch (error) {
            console.error('Download failed:', error);
            f7.toast.show({
                text: 'Download failed',
                position: 'center',
                closeTimeout: 2000,
            });
        }
    };


    const handleZoomIn = () => {
        if (zoom < 200) {
            setZoom(zoom + 25);
        }
    };

    const handleZoomOut = () => {
        if (zoom > 50) {
            setZoom(zoom - 25);
        }
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const isBlobUrl = (url) => typeof url === 'string' && url.startsWith('blob:');

    const getPdfViewerUrl = (url) => {
        if (!url) return null;

        if (isBlobUrl(url)) return url;

        const encodedUrl = encodeURIComponent(url);
        return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;

        // return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodedUrl}`;

        // return url;
    };

    return (
        <Sheet
            opened={isOpen}
            onSheetClosed={onClose}
            style={{
                height: '95vh',
            }}
            swipeToClose
        >
            <div className="sheet-inner" style={{ height: '100%' }}>
                <Navbar
                    title={title || 'PDF Document'}
                    left={{
                        text: 'Close',
                        onClick: onClose,
                        iconF7: 'chevron_left'
                    }}
                    right={[
                        {
                            iconF7: 'arrow_down_to_line',
                            onClick: handleDownload
                        }
                    ]}
                />

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '10px',
                    background: '#f5f5f5',
                    gap: '10px'
                }}>
                    <button
                        className="button button-small"
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                    >
                        <LuZoomOut size={16} />
                    </button>

                    <span style={{
                        padding: '6px 12px',
                        background: 'white',
                        borderRadius: '6px',
                        fontSize: '14px'
                    }}>
                        {zoom}%
                    </span>

                    <button
                        className="button button-small"
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                    >
                        <LuZoomIn size={16} />
                    </button>

                    <button
                        className="button button-small"
                        onClick={handleRotate}
                    >
                        <LuRotateCw size={16} />
                    </button>
                </div>

                <div style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#e5e5e5',
                    height: "100%"
                }}>
                    {isLoading && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            zIndex: 10
                        }}>
                            <Preloader color="blue" size={42} />
                            <p style={{ marginTop: '10px' }}>Loading PDF...</p>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            padding: '20px',
                            background: 'white',
                            borderRadius: '10px',
                        }}>
                            <p style={{ color: '#e74c3c', marginBottom: '10px' }}>
                                Failed to load PDF
                            </p>
                            <button
                                className="button button-fill"
                                onClick={() => window.open(pdfUrl, '_blank')}
                            >
                                Open in Browser
                            </button>
                        </div>
                    )}

                    {getPdfViewerUrl(pdfUrl) ? (
                        <iframe
                            ref={iframeRef}
                            src={getPdfViewerUrl(pdfUrl)}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                transformOrigin: 'center center',
                                transition: 'transform 0.2s ease'
                            }}
                            title={title || 'PDF Document'}
                            onLoad={() => {
                                setIsLoading(false);
                                setError(null);
                            }}
                            onError={() => {
                                setIsLoading(false);
                                setError('Failed to load PDF');
                            }}
                        />
                    ) : (
                        <div style={{ padding: 16, textAlign: 'center' }}>
                            <p>PDF URL is empty</p>
                        </div>
                    )}
                </div>
            </div>
        </Sheet>
    );
};