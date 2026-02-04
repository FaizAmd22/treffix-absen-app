import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, f7 } from 'framework7-react';
import FullImagePopup from '../../../../../components/fullImagePopup';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../../../slices/settingsSlice';
import ProofPopupPersonal from './proofPopupPersonal';
import { FaRegFilePdf } from "react-icons/fa6";
import { PdfViewer } from '../../../../../components/pdfViewer';
import { API } from '../../../../../api/axios';
import ButtonFixBottom from '../../../../../components/buttonFixBottom';
import CustomButton from '../../../../../components/customButton';
import { IoIosAdd } from 'react-icons/io';
import TypePopup from '../../../../../components/typePopup';
import Loading from '../../../../../components/loading';
import MessageAlert from '../../../../../components/messageAlert';
import { selectLanguages } from '../../../../../slices/languagesSlice';
import { translate } from '../../../../../utils/translate';
import UploadPicturePopup from '../../../../../components/uploadPicturePopup';
import AlertFailedLight from '../../../../../assets/messageAlert/alert-failed-light.png'
import AlertFailedDark from '../../../../../assets/messageAlert/alert-failed-dark.png'
import { decryptAccessDoc, prefetchDecryptDocs } from '../../../../../utils/accessDocDecrypt';
import ImageAlertLight from '../../../../../assets/messageAlert/absen-light.png'
import ImageAlertDark from '../../../../../assets/messageAlert/absen-dark.png'

const isCordova = () =>
    typeof window !== 'undefined' && window.cordova;

const matchesCaptureRoute = (v) => {
    if (!v) return false;
    const val = String(v).toLowerCase();
    return (
        val === 'identity_card' ||
        val === 'family_card' ||
        val === 'tax_number' ||
        val.includes('driving_license')
    );
};

const BerkasKaryawan = ({ data }) => {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedTitle, setSelectedTitle] = useState(null);
    const [popupOpened, setPopupOpened] = useState(false);
    const [popupUploadOpened, setPopupUploadOpened] = useState(false);
    const [fullImagePopupOpened, setFullImagePopupOpened] = useState(false);
    const [pdfViewerOpened, setPdfViewerOpened] = useState(false);
    const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
    const [selectedPdfTitle, setSelectedPdfTitle] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [mandatoryOptions, setMandatoryOptions] = useState([]);
    const [alertModalOpened, setAlertModalOpened] = useState(false);

    const [sheetPictureOpened, setSheetPictureOpened] = useState(false);
    const [pendingDocType, setPendingDocType] = useState(null);
    const [typeAlert, setTypeAlert] = useState(null);
    const [titleAlert, setTitleAlert] = useState(null);
    const [descAlert, setDescAlert] = useState(null);

    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const token = localStorage.getItem('token');

    const fileInputRef = useRef(null);

    const [openingDocId, setOpeningDocId] = useState(null);
    const [docCache, setDocCache] = useState({});

    const openPopupEncrypted = async (docItem) => {
        if (!docItem?.id) return;

        const docId = docItem.id;
        const title = docItem.document_name || '';

        try {
            setOpeningDocId(docId);

            const cached = docCache[docId];
            if (cached?.url && cached?.kind) {
                if (cached.kind === 'pdf') {
                    setSelectedPdfUrl(cached.url);
                    setSelectedPdfTitle(title);
                    setPdfViewerOpened(true);
                } else {
                    setSelectedDocument(cached.url);
                    setSelectedTitle(title);
                    setPopupOpened(true);
                }
                return;
            }

            const { url, kind } = await decryptAccessDoc(docId);

            setDocCache((prev) => ({
                ...prev,
                [docId]: { url, kind },
            }));

            if (kind === 'pdf') {
                setSelectedPdfUrl(url);
                setSelectedPdfTitle(title);
                setPdfViewerOpened(true);
            } else {
                setSelectedDocument(url);
                setSelectedTitle(title);
                setPopupOpened(true);
            }
        } catch (e) {
            console.error('openPopupEncrypted error:', e);
            setTypeAlert("Failed");
            setTitleAlert(translate('upload_failed', language));
            setDescAlert("Gagal membuka dokumen. Silakan coba lagi.");
            setAlertModalOpened(true);
        } finally {
            setOpeningDocId(null);
        }
    };


    const existingTypes = useMemo(() => {
        const docs = Array.isArray(data?.documents) ? data.documents : [];
        return new Set(docs.map(d => d.document_type));
    }, [data]);

    const fetchPersonal = async () => {
        setIsLoading(true);
        try {
            const responseSteps = await API.get("/mobile/employees/onboarding/steps");
            const fromApi = responseSteps?.data?.payload?.mandatory_documents ?? [];
            const filtered = fromApi.filter(item => !existingTypes.has(item.value));
            setMandatoryOptions(filtered);
        } catch (error) {
            console.log("Data request tidak bisa diakses", error);
            setMandatoryOptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPersonal();
    }, []);

    useEffect(() => {
        return () => {
            Object.values(docCache).forEach((v) => {
                if (v?.url && String(v.url).startsWith('blob:')) {
                    try { URL.revokeObjectURL(v.url); } catch (_) { }
                }
            });
        };
    }, [docCache]);

    const closePopup = () => setPopupOpened(false);
    const closePdfViewer = () => {
        setPdfViewerOpened(false);
        setSelectedPdfUrl(null);
        setSelectedPdfTitle(null);
    };
    const openFullImagePopup = () => {
        setPopupOpened(false);
        setFullImagePopupOpened(true);
    };
    const closeFullImagePopup = () => setFullImagePopupOpened(false);

    const postEmployeeDocumentWeb = async (file, docType) => {
        const form = new FormData();
        form.append('file', file);
        form.append('document_type', docType);

        console.log("form data :", form);

        await API.post('/mobile/employees/upload-document', form, {
            transformRequest: [(data) => data],
        })

        return;
    };

    const postEmployeeDocumentCordova = (fileUri, docType) => {
        const apiBaseUrl = API.defaults.baseURL || '';
        const uploadURL = apiBaseUrl + '/mobile/employees/upload-document';

        return new Promise((resolve, reject) => {
            const ft = new window.FileTransfer();
            const options = {
                fileKey: 'file',
                fileName: `photo_${Date.now()}.jpg`,
                mimeType: 'image/jpeg',
                httpMethod: 'POST',
                params: { document_type: docType },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                chunkedMode: true,
            };

            ft.upload(fileUri, encodeURI(uploadURL), resolve, reject, options);
        });
    };

    const notifyAndRefresh = (ok) => {
        if (ok) {
            setTypeAlert("Success")
            setTitleAlert(translate('upload_success', language))
            setDescAlert(translate('upload_success_text', language))
            setAlertModalOpened(true);
        } else {
            setTypeAlert("Success")
            setTitleAlert(translate('upload_failed', language))
            setDescAlert(translate('upload_failed_text', language))
            setAlertModalOpened(true);
        }
    };

    const getIconAlert = () => {
        if (typeAlert == "Success") {
            return theme === "light" ? ImageAlertLight : ImageAlertDark
        } else {
            return theme === "light" ? AlertFailedLight : AlertFailedDark
        }
    }

    const capturePhotoHandler = (typeUpload) => {
        if (!pendingDocType) return;

        if (isCordova()) {
            const destinationType =
                device.platform === 'iOS'
                    ? window.Camera.DestinationType.NATIVE_URI
                    : window.Camera.DestinationType.FILE_URI;

            const sourceType =
                typeUpload === 'camera'
                    ? window.Camera.PictureSourceType.CAMERA
                    : window.Camera.PictureSourceType.PHOTOLIBRARY;

            navigator.camera.getPicture(
                function onSuccess(imageUri) {
                    (async () => {
                        try {
                            await postEmployeeDocumentCordova(imageUri, pendingDocType);
                            setSheetPictureOpened(false);
                            notifyAndRefresh(true);
                        } catch (e) {
                            console.error(e);
                            setSheetPictureOpened(false);
                            notifyAndRefresh(false);
                        }
                    })();
                },
                function onError(err) {
                    console.error('Camera error:', err);
                    setSheetPictureOpened(false);
                    notifyAndRefresh(false);
                },
                {
                    quality: 80,
                    destinationType,
                    sourceType,
                    encodingType: window.Camera.EncodingType.JPEG,
                    mediaType: window.Camera.MediaType.PICTURE,
                    allowEdit: false,
                    correctOrientation: true,
                    targetWidth: 1600,
                    targetHeight: 1600,
                }
            );
            return;
        }

        if (typeUpload === 'gallery') {
            if (fileInputRef.current) fileInputRef.current.click();
        } else {
            if (fileInputRef.current) {
                fileInputRef.current.setAttribute('capture', 'environment');
                fileInputRef.current.click();
                setTimeout(() => fileInputRef.current && fileInputRef.current.removeAttribute('capture'), 0);
            }
        }
    };

    const prefetchedRef = useRef(false);

    useEffect(() => {
        const docs = Array.isArray(data?.documents) ? data.documents : [];
        if (docs.length === 0) return;
        if (prefetchedRef.current) return;

        prefetchedRef.current = true;

        prefetchDecryptDocs(
            docs,
            (docId, result) => {
                if (result?.url && result?.kind) {
                    setDocCache((prev) => ({
                        ...prev,
                        [docId]: { url: result.url, kind: result.kind },
                    }));
                }
            },
            {
                concurrency: 2,
                shouldSkip: (item) => !!docCache[item?.id]?.url,
            }
        );
    }, [data?.documents]);

    const onPickFile = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file || !pendingDocType) return;
        try {
            await postEmployeeDocumentWeb(file, pendingDocType);
            setSheetPictureOpened(false);
            notifyAndRefresh(true);
        } catch (err) {
            console.error(err);
            setSheetPictureOpened(false);
            notifyAndRefresh(false);
        } finally {
            e.target.value = '';
        }
    };

    if (isLoading) return <Loading height="80vh" />;

    const docs = Array.isArray(data?.documents) ? data.documents : [];

    const handleOpenUploadPopup = () => {
        if (mandatoryOptions.length === 0) {
            setTypeAlert("Failed")
            setTitleAlert(translate('files_completed', language))
            setDescAlert(translate('files_completed_text', language))
            setAlertModalOpened(true);
            return;
        }
        setPopupUploadOpened(true);
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={onPickFile}
            />

            <form style={{ fontSize: "var(--font-sm)", marginTop: "20px" }}>
                {docs.map((item, index) => (
                    <div key={item.id ?? index} style={{ marginBottom: "40px" }}>
                        <label style={{ fontWeight: 600 }}>{item.document_name}</label>

                        {item.document_url && (
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        borderRadius: "8px",
                                        padding: "10px",
                                        position: "relative",
                                        width: "100%",
                                        height: "100px"
                                    }}
                                >
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            openPopupEncrypted(item);
                                        }}
                                        disabled={openingDocId === item.id}
                                        style={{
                                            width: "100%",
                                            height: "150px",
                                            marginTop: "32px",
                                            marginLeft: "-10px",
                                            borderRadius: "8px",
                                            padding: 0,
                                            border: "none",
                                            textTransform: "capitalize"
                                        }}
                                    >
                                        {(() => {
                                            const cached = docCache[item.id];
                                            const isOpening = openingDocId === item.id;

                                            if (cached?.kind === 'image' && cached?.url) {
                                                return (
                                                    <img
                                                        src={cached.url}
                                                        alt={item.document_name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                                    />
                                                );
                                            }

                                            if (cached?.kind === 'pdf') {
                                                return (
                                                    <div style={{
                                                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                                        width: '100%', height: '100%',
                                                        backgroundColor: theme === "light" ? '#f5f5f5' : '#2c2c2c',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <FaRegFilePdf size="40px" style={{ color: "var(--color-red)" }} />
                                                        <div style={{ marginTop: 8, fontSize: 14, color: theme === "light" ? '#333' : '#ddd' }}>
                                                            Tap to view PDF
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div style={{
                                                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                                    width: '100%', height: '100%',
                                                    backgroundColor: theme === "light" ? '#f5f5f5' : '#2c2c2c',
                                                    borderRadius: '8px'
                                                }}>
                                                    <FaRegFilePdf size="40px" style={{ color: "var(--color-red)" }} />
                                                    <div style={{ marginTop: 8, fontSize: 14, color: theme === "light" ? '#333' : '#ddd' }}>
                                                        {isOpening ? 'Loading...' : 'Decrypting...'}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </form>

            <div style={{ marginLeft: "-4.5%" }}>
                <ButtonFixBottom needBorderTop={false}>
                    <CustomButton
                        bg={"var(--bg-primary-green)"}
                        color={"white"}
                        text={translate('upload_documents', language)}
                        handleClick={handleOpenUploadPopup}
                        icon={<IoIosAdd size={20} color="white" />}
                    />
                </ButtonFixBottom>
            </div>

            <TypePopup
                top="10%"
                title={translate('upload_documents', language)}
                opened={popupUploadOpened}
                onClose={() => setPopupUploadOpened(false)}
                options={mandatoryOptions}
                onSelect={(opt) => {
                    setPopupUploadOpened(false);
                    const query = `?value=${encodeURIComponent(opt.value)}&label=${encodeURIComponent(opt.label)}`;

                    if (matchesCaptureRoute(opt.value)) {
                        f7.views.main.router.navigate(`/capture-ktp/${query}`);
                        return;
                    }

                    setPendingDocType(opt.value);
                    setSheetPictureOpened(true);
                }}
            />

            <ProofPopupPersonal
                title={selectedTitle || ''}
                opened={popupOpened}
                onClose={closePopup}
                onViewImage={openFullImagePopup}
            />

            {selectedDocument ? (
                <FullImagePopup
                    opened={fullImagePopupOpened}
                    onClose={closeFullImagePopup}
                    imageSrc={selectedDocument}
                    documentType="image"
                />
            ) : null}

            {selectedPdfUrl ? (
                <PdfViewer
                    pdfUrl={selectedPdfUrl}
                    title={selectedPdfTitle || ''}
                    isOpen={pdfViewerOpened}
                    onClose={closePdfViewer}
                />
            ) : null}

            <MessageAlert
                sheetOpened={alertModalOpened}
                setSheetOpened={setAlertModalOpened}
                title={titleAlert}
                message={descAlert}
                imageAlert={getIconAlert()}
                btnCloseText={translate('close', language)}
                handleClick={() => f7.views.main.router.refreshPage()}
            />

            <UploadPicturePopup
                sheetOpened={sheetPictureOpened}
                setSheetOpened={setSheetPictureOpened}
                title={translate('detail_permission_proof_of_submission', language)}
                capturePhotoHandler={capturePhotoHandler}
            />
        </div>
    );
};

export default BerkasKaryawan;
