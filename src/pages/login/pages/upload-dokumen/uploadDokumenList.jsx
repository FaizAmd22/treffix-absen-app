import { f7, Page } from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../../slices/settingsSlice'
import ButtonFixBottom from '../../../../components/buttonFixBottom'
import CustomButton from '../../../../components/customButton'
import BackButton from '../../../../components/backButton'
import { API } from '../../../../api/axios'
import { useEffect, useRef, useState } from 'react'
import { GoCheckCircleFill, GoCircle } from 'react-icons/go'
import UploadPicturePopup from '../../../../components/uploadPicturePopup'
import { translate } from '../../../../utils/translate'
import { selectLanguages } from '../../../../slices/languagesSlice'
import MessageAlert from '../../../../components/messageAlert'
import AlertFailedLight from '../../../../assets/messageAlert/alert-failed-light.png'
import AlertFailedDark from '../../../../assets/messageAlert/alert-failed-dark.png'
import Loading from '../../../../components/loading'
import CustomPopup from '../../../../components/customPopup'
import ImageAlertLight from '../../../../assets/messageAlert/absen-light.png'
import ImageAlertDark from '../../../../assets/messageAlert/absen-dark.png'

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

const UploadDokumenList = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [dataDocument, setDataDocument] = useState([])
    const [completedDocument, setCompletedDocument] = useState([])
    const [alertModalOpened, setAlertModalOpened] = useState(false);
    const [hasUploaded, setHasUploaded] = useState(false);
    const [popupOpened, setPopupOpened] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [sheetPictureOpened, setSheetPictureOpened] = useState(false);
    const [pendingDocType, setPendingDocType] = useState(null);
    const [typeAlert, setTypeAlert] = useState(null);
    const [titleAlert, setTitleAlert] = useState(null);
    const [descAlert, setDescAlert] = useState(null);
    const [selectedItem, setSelectedItem] = useState({});

    const token = localStorage.getItem('token');
    const fileInputRef = useRef(null);

    const fetchData = async () => {
        const getSteps = await API.get("/mobile/employees/onboarding/steps");
        setDataDocument(getSteps.data.payload.mandatory_documents)
        setCompletedDocument(getSteps.data.payload.uploaded_documents)
        console.log("dataDocument :", dataDocument.length);
        console.log("completedDocument :", completedDocument.length);
    }

    const isDisableSubmit = dataDocument.length === completedDocument.length

    useEffect(() => {
        setIsLoading(true)
        fetchData()
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    }, [])

    const handleSubmit = async () => {
        try {
            await API.put('/mobile/employees/onboarding/steps', { step: "upload_document" });
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => {
                setPopupOpened(false)
                f7.views.main.router.navigate("/employe-data/", { clearPreviousHistory: true })
                localStorage.removeItem("isOnboarding")
            }, 500);
        }
    }

    const handleClick = (opt) => {
        setSelectedItem(opt)
        if (completedDocument.includes(opt.value)) {
            setHasUploaded(true)
        } else {
            if (matchesCaptureRoute(opt.value)) {
                const params = `?value=${encodeURIComponent(opt.value)}&label=${encodeURIComponent(opt.label)}`;
                f7.views.main.router.navigate(`/capture-ktp/${params}`);
            } else {
                setPendingDocType(opt.value);
                setSheetPictureOpened(true)
            }
        }
    }

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

    const onPageBeforeIn = () => {
        setIsLoading(true)
        fetchData()
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    };

    if (isLoading) {
        return (
            <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} onPageBeforeIn={onPageBeforeIn}>
                <div style={{ padding: "15px", marginBottom: "90px", color: theme === "light" ? "black" : "white" }}>
                    <BackButton label="Kelengkapan Berkas Karyawan" />
                    <Loading height={"80vh"} />
                </div>
            </Page>
        )
    }

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} onPageBeforeIn={onPageBeforeIn}>
            <div style={{ padding: "15px", marginBottom: "90px", color: theme === "light" ? "black" : "white" }}>
                <BackButton label="Kelengkapan Berkas Karyawan" />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={onPickFile}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                    {dataDocument.map((item, index) => {
                        const isCompleted = completedDocument.includes(item.value);
                        return (
                            <div key={index} onClick={() => handleClick(item)} style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", padding: "8px 16px", borderRadius: "8px", boxShadow: "0 2px 16px 0 rgba(0, 0, 0, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <p>{item.label}</p>

                                {isCompleted ? (
                                    <GoCheckCircleFill style={{ width: "20px", height: "20px", color: "var(--color-green)" }} />
                                ) : (
                                    <GoCircle style={{ width: "20px", height: "20px", color: "#E5E5E5" }} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <ButtonFixBottom needBorderTop={false} needShadow>
                <CustomButton
                    handleClick={() => setPopupOpened(true)}
                    color={!isDisableSubmit ? "#B3B3B3" : "white"}
                    bg={!isDisableSubmit ? "#F0F0F0" : "var(--bg-primary-green)"}
                    text={"Berkas Sudah Lengkap"}
                    disable={!isDisableSubmit}
                />
            </ButtonFixBottom>

            <MessageAlert
                sheetOpened={alertModalOpened}
                setSheetOpened={setAlertModalOpened}
                title={titleAlert}
                message={descAlert}
                imageAlert={getIconAlert()}
                btnCloseText={translate('close', language)}
                handleClick={() => f7.views.main.router.refreshPage()}
            />

            <MessageAlert
                sheetOpened={hasUploaded}
                setSheetOpened={setHasUploaded}
                title={`${selectedItem?.label} Berhasil Diverifikasi`}
                message={`Anda sudah berhasil melakukan verifikasi ${selectedItem?.label}. Anda dapat melakukan verifikasi ulang ${selectedItem?.label} jika diperlukan.`}
                imageAlert={theme === "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
                handleClick={() => {
                    setHasUploaded(false)
                    setHasUploaded(false)
                }}
                btnSubmitText="Verifikasi Ulang"
                handleSubmit={() => {
                    console.log("selectedItem :", selectedItem);
                    setHasUploaded(false)
                    if (matchesCaptureRoute(selectedItem.value)) {
                        const params = `?value=${encodeURIComponent(selectedItem.value)}&label=${encodeURIComponent(selectedItem.label)}`;
                        f7.views.main.router.navigate(`/capture-ktp/${params}`);
                    } else {
                        setPendingDocType(selectedItem.value);
                        setSheetPictureOpened(true)
                    }
                }}
            />

            <CustomPopup
                popupOpened={popupOpened}
                setPopupOpened={setPopupOpened}
                title={"Pelengkapan Berkas Selesai"}
                message={"Terima kasih telah melengkapi seluruh berkas onboarding. Mohon pastikan semua informasi yang Anda isi sudah benar dan sesuai sebelum melanjutkan ke tahap berikutnya."}
                btnNo={translate('procurement_cancel', language)}
                handleCancel={() => setPopupOpened(false)}
                btnYes={translate('done', language)}
                handleConfirm={handleSubmit}
                top={280}
            />

            <UploadPicturePopup
                sheetOpened={sheetPictureOpened}
                setSheetOpened={setSheetPictureOpened}
                title={translate('detail_permission_proof_of_submission', language)}
                capturePhotoHandler={capturePhotoHandler}
            />
        </Page>
    )
}

export default UploadDokumenList