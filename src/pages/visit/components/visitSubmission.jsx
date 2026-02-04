import { Block, Button, f7, Page } from 'framework7-react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import ProofPopup from '../../../components/proofPopup';
import FullImagePopup from '../../../components/fullImagePopup';
import BackButton from '../../../components/backButton';
import { selectVisitIn, setVisitIn, setVisitOut } from '../../../slices/visitSlice';
import GetLocation from '../../../functions/getLocation';
import { GetAddress } from '../../../functions/getAddress';
import { LuMapPin } from 'react-icons/lu';
import { FaChevronRight } from 'react-icons/fa';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { showToast, showToastFailed } from '../../../functions/toast';
import { capturePhoto, isCordova, uploadImageToAPI } from '../../../functions/photoUtils';
import CameraIcon from '../../../icons/camera';
import UploadPicturePopup from '../../../components/uploadPicturePopup';
import Loading from '../../../components/loading';

const VisitSubmission = () => {
    const [visitName, setVisitName] = useState("");
    const [visitDesc, setVisitDesc] = useState("");
    const [visitProofImage, setVisitProofImage] = useState(null);
    const [popupOpened, setPopupOpened] = useState(false);
    const [fullImagePopupOpened, setFullImagePopupOpened] = useState(false);
    const [sheetPictureOpened, setSheetPictureOpened] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const token = localStorage.getItem("token")
    const dispatch = useDispatch()

    const visitIn = useSelector(selectVisitIn)
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages)

    const openPopup = () => setPopupOpened(true);
    const closePopup = () => setPopupOpened(false);

    const openFullImagePopup = () => setFullImagePopupOpened(true);
    const closeFullImagePopup = () => {
        setFullImagePopupOpened(false);
        setPopupOpened(true);
    };

    const capturePhotoHandler = (typeUpload) => {
        capturePhoto({
            onSuccess: async (fileInfo, uri) => {
                await uploadImageToAPI({
                    file: uri,
                    setImageUrl: setVisitProofImage,
                    setUploading: setIsUploading,
                    token,
                });
            },
            onError: () => document.getElementById('visitProof').click(),
            setUploading: setIsUploading,
            typeProof: "visitProof",
            typeUpload: typeUpload,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setIsLoading(true)

        if (!visitName || !visitDesc || !visitProof) {
            // f7.dialog.alert(translate('visit_need_filled', language));
            showToastFailed(translate('visit_need_filled', language))
            return;
        }

        if (visitIn == null) {
            dispatch(setVisitIn(new Date()))
            dispatch(setVisitOut(null))
        } else {
            dispatch(setVisitOut(new Date()))
            dispatch(setVisitIn(null))
        }

        setTimeout(() => {
            setIsLoading(false)
            // f7.dialog.alert(translate('visit_submission_successful', language), () => {
            //     f7.views.main.router.back();
            // });
            f7.views.main.router.back();
            showToast(translate('visit_submission_successful', language), theme)
        }, 2000);
    };

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const visitProofChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("proof", file);
        setIsUploading(true);

        try {
            const response = await uploadImageToAPI({
                file,
                setImageUrl: setVisitProofImage,
                setUploading: setIsUploading,
                token,
            });
        } catch (err) {
            showToastFailed("Upload gagal");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteProof = () => {
        setVisitProof(null);
        setVisitProofImage(null);
        closePopup();
    };

    const handleReplaceProof = () => {
        closePopup();
        capturePhoto();
    };

    useEffect(() => {
        if (typeof document !== 'undefined' && isCordova()) {
            document.addEventListener('deviceready', onDeviceReady, false);
            return () => {
                document.removeEventListener('deviceready', onDeviceReady, false);
            };
        }
    }, []);

    const onDeviceReady = () => {
        console.log('Cordova is ready');
    };

    const handleOpenMap = () => {
        localStorage.setItem("location_lat", userLocation.lat)
        localStorage.setItem("location_lng", userLocation.lng)
        f7.views.main.router.navigate("/visit-map/")
    }

    const isButtonEnabled = visitName && visitDesc && visitProof;

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <Block style={{ marginTop: "5px", margin: "0", padding: "0", color: theme == "light" ? "black" : "white" }}>
                <div style={{ padding: "0 20px", marginBottom: "100px", fontSize: "var(--font-sm)" }}>
                    <BackButton label={visitIn == null ? translate('visit_in', language) : translate('visit_out', language)} />

                    <p style={{ fontWeight: 700, margin: 0 }}>{translate('visit_pin_point_address', language)}</p>
                    <div style={{ border: theme === "light" ? "1px solid #E5E5E5" : "1px solid #363636", borderRadius: "8px", padding: "0 10px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <LuMapPin size={20} style={{ color: "var(--bg-primary-green)" }} />

                        {userLocation ? (
                            <div onClick={handleOpenMap} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <p><GetAddress locationData={userLocation} /></p>
                                <FaChevronRight size={16} style={{ color: "var(--bg-primary-green)" }} />
                            </div>
                        ) : <p><GetLocation onLocationFound={setUserLocation} /></p>}
                    </div>

                    <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                        <label style={{ fontWeight: "700" }} htmlFor="visitName">{translate('visit_address_name', language)}</label>
                        <input
                            type="text"
                            id="visitName"
                            style={{ width: "100%", padding: "17px", marginBottom: "10px", borderRadius: "5px", border: theme === "light" ? "1px solid #E5E5E5" : "1px solid #363636", }}
                            value={visitName}
                            onChange={handleInputChange(setVisitName)}
                            placeholder={translate('visit_address_name_text', language)}
                        />

                        <label style={{ fontWeight: "700" }} htmlFor="visitDesc">{translate('visit_desc', language)}</label>
                        <textarea
                            id="visitDesc"
                            value={visitDesc}
                            onChange={handleInputChange(setVisitDesc)}
                            placeholder={translate('visit_desc_text', language)}
                            style={{ width: "100%", height: "120px", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: theme === "light" ? "1px solid #E5E5E5" : "1px solid #363636", }}
                        />

                        <label style={{ fontWeight: "700" }} htmlFor="visitProof">{translate('visit_proof', language)}</label>
                        <div style={{ display: "flex", alignItems: "center", border: theme === "light" ? "1px solid #E5E5E5" : "1px solid #363636", borderRadius: "8px", position: "relative", width: "100%", height: visitProofImage ? "200px" : "150px", marginBottom: "10px" }}>
                            <input
                                type="file"
                                id="visitProof"
                                onChange={visitProofChange}
                                style={{ display: "none" }}
                                accept=".jpg,.png,.jpeg"
                            />
                            {visitProofImage ? (
                                <div onClick={openPopup} style={{ width: "100%", height: "100%" }}>
                                    <img
                                        src={visitProofImage}
                                        alt="uploaded"
                                        style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                </div>
                            ) : isUploading ? (
                                <Loading />
                            ) : (
                                <div
                                    onClick={() => setSheetPictureOpened(true)}
                                    style={{
                                        height: "150px",
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                    }}
                                >
                                    <div style={{ width: "50px", height: "50px", background: theme == "light" ? "var(--border-primary-gray)" : "#363636", borderRadius: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <CameraIcon fillColor="var(--bg-primary-green)" width={32} height={32} />
                                    </div>
                                    <p style={{ marginTop: "0px" }}>{translate('visit_take_picture', language)}</p>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div style={{ width: "100%", height: "80px", borderTop: theme == "light" ? "1px solid var(--border-primary-gray)" : "1px solid #363636", background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", position: "fixed", bottom: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Button
                        type="submit"
                        style={{
                            width: "90%",
                            backgroundColor: (!isButtonEnabled || isLoading) ? "var(--color-dark-gray)" : visitIn != null ? "var(--color-red)" : "var(--bg-primary-green)",
                            color: "white",
                            fontSize: "var(--font-sm)",
                            fontWeight: "700",
                            padding: "25px 0px",
                            textTransform: "capitalize",
                            borderRadius: "8px",
                            marginBottom: "10px"
                        }}
                        disabled={!isButtonEnabled || isLoading}
                        onClick={handleSubmit}
                    >
                        <p>{isLoading ? "Loading..." : visitIn != null ? translate('visit_out', language) : translate('visit_start', language)}</p>
                    </Button>
                </div>
            </Block>

            <ProofPopup
                title={visitIn != null ? translate('visit_out_proof', language) : translate('visit_in_proof', language)}
                opened={popupOpened}
                onClose={closePopup}
                onViewImage={openFullImagePopup}
                onReplaceImage={handleReplaceProof}
                onDeleteImage={handleDeleteProof}
            />

            <UploadPicturePopup
                sheetOpened={sheetPictureOpened}
                setSheetOpened={setSheetPictureOpened}
                title={translate('visit_proof', language)}
                capturePhotoHandler={capturePhotoHandler}
            />

            <FullImagePopup
                opened={fullImagePopupOpened}
                onClose={closeFullImagePopup}
                imageSrc={visitProofImage}
            />
        </Page>
    );
}

export default VisitSubmission;