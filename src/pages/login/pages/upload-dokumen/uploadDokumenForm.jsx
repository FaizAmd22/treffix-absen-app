import { f7, Page } from 'framework7-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import BackButton from '../../../../components/backButton';
import FullImagePopup from '../../../../components/fullImagePopup';
import ProofPopup from '../../../../components/proofPopup';
import { API } from '../../../../api/axios';
import { selectLanguages } from '../../../../slices/languagesSlice';
import { translate } from '../../../../utils/translate';
import { showToastFailed } from '../../../../functions/toast';
import MessageAlert from '../../../../components/messageAlert';
import UploadPicturePopup from '../../../../components/uploadPicturePopup';
import { capturePhoto } from '../../../../functions/photoUtils';
import Loading from '../../../../components/loading';
import ButtonFixBottom from '../../../../components/buttonFixBottom';
import CustomButton from '../../../../components/customButton';
import CameraIcon from '../../../../icons/camera';
import { selectSettings } from '../../../../slices/settingsSlice';
import ImageAlertLight from '../../../../assets/messageAlert/absen-light.png'
import ImageAlertDark from '../../../../assets/messageAlert/absen-dark.png'

const UploadDokumenForm = () => {
    const [documentImages, setDocumentImages] = useState({});
    const [mandatoryDocuments, setMandatoryDocuments] = useState([]);
    const [docPopupOpened, setDocPopupOpened] = useState(false);
    const [currentDocType, setCurrentDocType] = useState('');
    const [fullImagePopupOpened, setFullImagePopupOpened] = useState(false);
    const [sheetPictureOpened, setSheetPictureOpened] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState('')
    const [sheetOpened, setSheetOpened] = useState(false);

    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const token = localStorage.getItem("token");

    const openDocPopup = (docType) => {
        setCurrentDocType(docType);
        setDocPopupOpened(true);
    };
    const closeDocPopup = () => setDocPopupOpened(false);
    const openFullImagePopup = () => setFullImagePopupOpened(true);
    const closeFullImagePopup = () => {
        setFullImagePopupOpened(false);
        setDocPopupOpened(true);
    };

    const getTitle = () => {
        const doc = mandatoryDocuments.find(doc => doc.value === currentDocType);
        return doc ? doc.label : '';
    };

    const getCurrentImage = () => {
        return documentImages[currentDocType] || null;
    };

    const setCurrentImage = (imageUrl) => {
        setDocumentImages(prev => ({
            ...prev,
            [currentDocType]: imageUrl
        }));
    };

    const getSteps = async () => {
        try {
            const response = await API.get("/mobile/employees/onboarding/steps");
            console.log(response.data);

            if (response.data.payload && response.data.payload.mandatory_documents) {
                setMandatoryDocuments(response.data.payload.mandatory_documents);

                const initialImages = {};
                response.data.payload.mandatory_documents.forEach(doc => {
                    initialImages[doc.value] = null;
                });
                setDocumentImages(initialImages);
            }
        } catch (error) {
            console.error('Error fetching steps:', error);
            showToastFailed('Gagal memuat data dokumen');
        }
    }

    useEffect(() => {
        getSteps()
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoadingSubmit(true);

        try {
            await API.put('/mobile/employees/onboarding/steps', { step: "upload_document" })
            setSheetOpened(true);
        } catch (error) {
            showToastFailed('Gagal Upload Dokumen!')
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    const uploadImageToAPI = async ({ file, docType, setImageUrl, setUploading, token }) => {
        try {
            setUploading(docType);

            console.log("uploadImageToAPI run for docType:", docType);

            if (typeof file === 'string' && window.cordova) {
                const apiBaseUrl = API.defaults.baseURL || '';
                const uploadURL = apiBaseUrl + '/mobile/employees/upload-document';

                return new Promise((resolve, reject) => {
                    const fileTransfer = new FileTransfer();
                    const options = {
                        fileKey: 'file',
                        fileName: `photo_${new Date().getTime()}.jpg`,
                        mimeType: 'image/jpeg',
                        chunkedMode: true,
                        params: {
                            document_type: docType
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };

                    fileTransfer.upload(
                        file,
                        encodeURI(uploadURL),
                        (result) => {
                            try {
                                const response = JSON.parse(result.response);
                                const imageUrl = response.payload?.url;
                                if (imageUrl) {
                                    setImageUrl(imageUrl);
                                    resolve(true);
                                } else {
                                    showToastFailed('Format tidak sesuai.');
                                    resolve(false);
                                }
                            } catch {
                                showToastFailed('Server tidak merespon.');
                                resolve(false);
                            }
                        },
                        (error) => {
                            console.error('Upload error:', error);
                            showToastFailed('Upload gagal.');
                            reject(error);
                        },
                        options
                    );
                });
            }

            if (file instanceof File) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('document_type', docType);

                const response = await API.post('/mobile/employees/upload-document', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const imageUrl = response.data?.payload?.url;
                if (imageUrl) {
                    setImageUrl(imageUrl);
                    return true;
                } else {
                    showToastFailed('Format tidak sesuai.');
                    return false;
                }
            }

            throw new Error('Unsupported file format');
        } catch (err) {
            console.error('Upload error:', err);
            showToastFailed('Upload gagal.');
            return false;
        } finally {
            setUploading("");
        }
    };

    const capturePhotoHandler = (typeUpload) => {
        capturePhoto({
            onSuccess: async (fileInfo, uri) => {
                await uploadImageToAPI({
                    file: uri,
                    docType: currentDocType,
                    setImageUrl: setCurrentImage,
                    setUploading: setUploadingDoc,
                    token,
                });
                setSheetPictureOpened(false);
            },
            onError: () => {
                document.getElementById(`${currentDocType}File`).click();
            },
            setUploading: setUploadingDoc,
            typeProof: `${currentDocType}File`,
            typeUpload: typeUpload,
        });
    };

    const handleDocumentChange = async (event, docType) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("document_type", docType);

        setUploadingDoc(docType);
        console.log("formData :", formData);

        try {
            const response = await API.post("/mobile/employees/upload-document", formData);
            console.log("response upload:", response.data.payload);
            const data = response.data.payload;

            setDocumentImages(prev => ({
                ...prev,
                [docType]: data.url
            }));
        } catch (error) {
            console.error(error);
            showToastFailed(translate('submission_permission_document_upload_alert', language));
        } finally {
            setUploadingDoc("");
        }
    };

    const handleDeleteDocument = () => {
        setCurrentImage(null);
        closeDocPopup();
    };

    const handleReplaceDocument = () => {
        document.getElementById(`${currentDocType}File`).click();
        closeDocPopup();
    };

    const openSheetForDoc = (docType) => {
        setCurrentDocType(docType);
        setSheetPictureOpened(true);
    };

    const handleSuccessUpload = () => {
        setSheetOpened(false)
        f7.views.main.router.navigate('/home/', {
            reloadCurrent: false,
            replaceState: true,
            clearPreviousHistory: true,
            props: {
                targetTab: 'view-home'
            }
        })
    }

    const areRequiredDocumentsUploaded = () => {
        return documentImages['identity_card'];
    };

    const renderDocumentUpload = (doc) => (
        <div key={doc.value} style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "600" }} htmlFor={`${doc.value}File`}>
                {doc.label}
            </label>

            <div style={{
                display: "flex",
                alignItems: "center",
                borderRadius: "5px",
                padding: "10px",
                position: "relative",
                width: "100%",
                height: "150px",
            }}>
                <input
                    type="file"
                    id={`${doc.value}File`}
                    onChange={(e) => handleDocumentChange(e, doc.value)}
                    style={{ display: "none" }}
                    accept='.jpg, .png, .jpeg'
                />
                {documentImages[doc.value] ? (
                    <div
                        type="button"
                        onClick={() => openDocPopup(doc.value)}
                        style={{
                            width: "100%",
                            height: "160px",
                            marginLeft: "-10px",
                            borderRadius: "5px",
                            marginTop: "20px",
                            padding: 0,
                            border: "none"
                        }}
                    >
                        <img src={documentImages[doc.value]} alt="uploaded" style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "5px"
                        }} />
                    </div>
                ) : uploadingDoc === doc.value ? (
                    <div style={{
                        marginTop: "10px",
                        marginLeft: "-10px",
                        marginRight: "10px",
                        width: "100%"
                    }}>
                        <div style={{
                            height: "150px",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "5px",
                            border: "1px solid #E5E5E5",
                            backgroundColor: "#f8f9fa"
                        }}>
                            <Loading height="100%" />
                        </div>
                    </div>
                ) : (
                    <div style={{ marginLeft: "-10px", marginRight: "10px", width: "100%" }}>
                        <div
                            onClick={() => openSheetForDoc(doc.value)}
                            style={{
                                height: "150px",
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                borderRadius: "5px",
                                border: "1px solid #E5E5E5"
                            }}
                        >
                            <div style={{
                                width: "50px",
                                height: "50px",
                                background: "var(--border-primary-gray)",
                                borderRadius: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <CameraIcon fillColor="var(--bg-primary-green)" width={30} height={30} />
                            </div>
                            <p style={{ marginTop: "10px", color: "black" }}>Upload File</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "0 20px", marginBottom: "100px", marginTop: "5px", color: theme === "light" ? "black" : "white" }}>
                <BackButton label="Unggah Dokumen" />
                <form onSubmit={handleSubmit} style={{ fontSize: "var(--font-sm)" }}>
                    {mandatoryDocuments.map(doc => renderDocumentUpload(doc))}
                </form>
            </div>

            <ButtonFixBottom needBorderTop={true}>
                {isLoadingSubmit ? (
                    <CustomButton
                        color={"white"}
                        bg={"var(--color-gray)"}
                        disable={true}
                        text={"Loading..."}
                    />
                ) : (
                    <CustomButton
                        handleClick={handleSubmit}
                        color={"white"}
                        bg={areRequiredDocumentsUploaded() ? "var(--bg-primary-green)" : "var(--color-gray)"}
                        disable={!areRequiredDocumentsUploaded()}
                        text={"Upload"}
                    />
                )}
            </ButtonFixBottom>

            <ProofPopup
                title={getTitle()}
                opened={docPopupOpened}
                onClose={closeDocPopup}
                onViewImage={openFullImagePopup}
                onReplaceImage={handleReplaceDocument}
                onDeleteImage={handleDeleteDocument}
            />

            <FullImagePopup
                opened={fullImagePopupOpened}
                onClose={closeFullImagePopup}
                imageSrc={getCurrentImage()}
            />

            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={"Upload Document Berhasil!"}
                message={""}
                imageAlert={theme === "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
                handleClick={handleSuccessUpload}
            />

            <UploadPicturePopup
                sheetOpened={sheetPictureOpened}
                setSheetOpened={setSheetPictureOpened}
                title={getTitle()}
                capturePhotoHandler={capturePhotoHandler}
            />
        </Page>
    );
};

export default UploadDokumenForm;