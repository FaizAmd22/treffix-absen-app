import { Block, Button, f7, Page } from 'framework7-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import ProofPopup from '../../../components/proofPopup';
import FullImagePopup from '../../../components/fullImagePopup';
import BackButton from '../../../components/backButton';
import TypePopup from '../../../components/typePopup';
import { API } from '../../../api/axios';
import { selectUser } from '../../../slices/userSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { showToastFailed } from '../../../functions/toast';
import MessageAlert from '../../../components/messageAlert';
import UploadPicturePopup from '../../../components/uploadPicturePopup';
import { capturePhoto, uploadImageToAPI } from '../../../functions/photoUtils';
import Loading from '../../../components/loading';
import ButtonFixBottom from '../../../components/buttonFixBottom';
import CustomButton from '../../../components/customButton';
import InputText from '../../../components/inputText';
import InputNumber from '../../../components/inputNumber';
import InputDropdown from '../../../components/inputDropdown';
import InputTextarea from '../../../components/inputTextarea';
import CameraIcon from '../../../icons/camera';
import ImageAlertLight from '../../../assets/messageAlert/reimburse-light.png'
import ImageAlertDark from '../../../assets/messageAlert/reimburse-dark.png'

const ReimburseSubmission = () => {
    const [reimburseName, setReimburseName] = useState(null);
    const [reimburseType, setReimburseType] = useState(null);
    const [reimburseReason, setReimburseReason] = useState(null);
    const [reimburseCount, setReimburseCount] = useState(null);
    const [reimburseCountDisplay, setReimburseCountDisplay] = useState("");
    const [reimburseProofImage, setReimburseProofImage] = useState(null);
    const [popupOpened, setPopupOpened] = useState(false);
    const [fullImagePopupOpened, setFullImagePopupOpened] = useState(false);
    const [typePopupOpened, setTypePopupOpened] = useState(false);
    const [sheetOpened, setSheetOpened] = useState(false);
    const [sheetPictureOpened, setSheetPictureOpened] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [budget, setBudget] = useState([]);
    const [submissionId, setSubmissionId] = useState([]);
    const [submissionTypes, setSubmissionTypes] = useState([]);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages)
    const user = useSelector(selectUser)
    const token = localStorage.getItem("token")

    console.log("reimburseProofImage :", reimburseProofImage);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await API.get("/reimbursement-category-grade", {
                    params: {
                        page: 1,
                        sort_by: "created_at desc",
                        limit: 100,
                    },
                });

                console.log("reimburse category :", response.data.payload);
                const data = response.data.payload
                setBudget(data.map(item => item.budget))
                setSubmissionTypes(data.map(item => item.name))
                setSubmissionId(data.map(item => item.id))
            } catch (error) {
                console.log("Data options tidak bisa diakses", error);
            }
        };

        if (token) {
            fetchOptions();
        }
    }, [token]);

    const openTypePopup = () => setTypePopupOpened(true);
    const closeTypePopup = () => setTypePopupOpened(false);

    const openPopup = () => setPopupOpened(true);
    const closePopup = () => setPopupOpened(false);

    const openFullImagePopup = () => setFullImagePopupOpened(true);
    const closeFullImagePopup = () => {
        setFullImagePopupOpened(false)
        setPopupOpened(true)
    };

    const formatRupiah = (value) => {
        const numberString = value.replace(/[^0-9]/g, "");
        if (!numberString) return "";

        return new Intl.NumberFormat("id-ID").format(Number(numberString));
    };

    const parseRupiah = (formattedValue) => {
        return parseFloat(formattedValue.replace(/\./g, "")) || 0;
    };

    const handleRupiahChange = (event) => {
        const rawValue = event.target.value;
        const formattedValue = formatRupiah(rawValue);

        setReimburseCountDisplay(formattedValue);
        setReimburseCount(parseRupiah(formattedValue));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoadingSubmit(true)

        if (!reimburseName || !reimburseType || !reimburseCount || !reimburseProofImage) {
            // f7.dialog.alert(translate('reimburse_submit_unfilled', language));
            showToastFailed(translate('reimburse_submit_unfilled', language))
            return;
        }

        const leaveRequest = {
            reimbursement_category_id: submissionId[selectedIndex],
            amount: reimburseCount,
            title: reimburseName,
            reason: reimburseReason,
            proof: reimburseProofImage || "",
        };

        try {
            const response = await API.post("/mobile/form-request-reimbursement", leaveRequest);

            console.log("response submit :", response);
            // f7.dialog.alert(translate('reimburse_submit_success', language), () => f7.views.main.router.back('/reimburse/', { reloadCurrent: true }));
            f7.views.main.router.back('/reimburse/', { reloadCurrent: true })
            // showToast(translate('reimburse_submit_success', language), theme)
            setSheetOpened(true)
        } catch (error) {
            console.log("error :", error);
            // f7.dialog.alert(translate('reimburse_submit_failed', language) +
            //     (error.response?.data?.message || error.message || "Unknown error"));
            showToastFailed(translate('reimburse_submit_failed', language) + (error.response?.data?.message || error.message || "Unknown error"))
        } finally {
            setIsLoadingSubmit(false)
        }
    };

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const handleDocumentChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("proof", file);
        setIsUploading(true)

        try {
            const response = await API.post("/mobile/form-request/proof", formData);

            console.log("response upload :", response.data.payload);
            const data = response.data.payload
            setReimburseProofImage(data.url);
        } catch (error) {
            console.log("error :", error);
            // f7.dialog.alert(translate('reimburse_submit_failed_upload', language));
            showToastFailed(translate('reimburse_submit_failed_upload', language))
        } finally {
            setIsUploading(false)
        }
    };

    const capturePhotoHandler = (typeUpload) => {
        console.log("capturePhotoHandler run ...");

        capturePhoto({
            onSuccess: async (fileInfo, uri) => {
                await uploadImageToAPI({
                    file: uri,
                    setImageUrl: setReimburseProofImage,
                    setUploading: setIsUploading,
                    token,
                });
            },
            onError: () => document.getElementById('reimburseProof').click(),
            setUploading: setIsUploading,
            typeProof: "reimburseProof",
            typeUpload: typeUpload,
        });
    };

    const handleDeleteProof = () => {
        setReimburseProofImage(null);
        closePopup();
    };

    const handleReplaceProof = () => {
        document.getElementById('reimburseProof').click();
        closePopup();
    };

    const isButtonEnabled = reimburseName && reimburseType && reimburseProofImage;

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <Block style={{ marginTop: "5px", margin: "0", padding: "0", color: theme == "light" ? "black" : "white", marginBottom: "120px" }}>
                <div style={{ padding: "0 15px", paddingBottom: "80px" }}>
                    <BackButton label={translate('reimburse_submission', language)} />

                    <form onSubmit={handleSubmit} style={{ fontSize: "var(--font-sm)" }}>
                        <InputText
                            type={"text"}
                            id={"reimburseName"}
                            value={reimburseName}
                            onChange={handleInputChange(setReimburseName)}
                            title={translate('detail_reimburse_name', language)}
                            placeholder={translate('detail_reimburse_name_text', language)}
                            theme={theme}
                        />

                        <InputDropdown
                            title={translate('detail_reimburse_type', language)}
                            value={reimburseType}
                            noValue={translate('detail_reimburse_type_text', language)}
                            onClick={openTypePopup}
                            theme={theme}
                        />

                        <InputNumber
                            title={translate('detail_reimburse_amount', language)}
                            id={"reimburseCount"}
                            type='rupiah'
                            value={reimburseCountDisplay}
                            placeholder={translate('detail_reimburse_amount_text', language)}
                            onChange={handleRupiahChange}
                            theme={theme}
                        />

                        {
                            reimburseType && <p style={{ margin: 0, marginBottom: "15px", fontSize: "var(--font-sm)", fontWeight: 400 }}>{translate('reimburse_submit_budget_limit1', language)} {reimburseType} {translate('reimburse_submit_budget_limit2', language)} {formatRupiah(budget[selectedIndex]?.toString())} </p>
                        }

                        <InputTextarea
                            title={translate('detail_reimburse_reason_optional', language)}
                            id={"reimburseReason"}
                            type={"label"}
                            noMargin={false}
                            placeholder={translate('detail_reimburse_reason_text', language)}
                            value={reimburseReason}
                            onChange={handleInputChange(setReimburseReason)}
                            theme={theme}
                        />

                        <label style={{ fontWeight: "600" }} htmlFor="reimburseProof">{translate('detail_reimburse_proof', language)}</label>
                        <div style={{ display: "flex", alignItems: "center", borderRadius: "5px", padding: "10px", position: "relative", width: "100%", height: "100px" }}>
                            <input
                                type="file"
                                id="reimburseProof"
                                onChange={handleDocumentChange}
                                style={{ display: "none" }}
                                accept='.jpg, .png, .jpeg'
                            />
                            {reimburseProofImage ? (
                                <Button
                                    type="button"
                                    onClick={openPopup}
                                    style={{ width: "100%", height: "200px", marginTop: "100px", marginLeft: "-10px", borderRadius: "5px", padding: 0, border: "none" }}>
                                    <img src={reimburseProofImage} alt="uploaded" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "5px" }} />
                                </Button>
                            ) : isUploading ? (
                                <div style={{ width: "100%", height: "150px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", cursor: "pointer", borderRadius: "5px", border: theme === "light" ? "1px solid #E5E5E5" : "1px solid #363636", marginTop: "32px", marginLeft: "-10px", marginRight: "10px" }}>
                                    <Loading height={"100%"} />
                                </div>
                            ) : (
                                <div
                                    onClick={() => setSheetPictureOpened(true)}
                                    style={{ height: "150px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", cursor: "pointer", borderRadius: "5px", border: theme === "light" ? "1px solid #E5E5E5" : "1px solid #363636", marginTop: "32px", marginLeft: "-10px", marginRight: "10px" }}>
                                    <div style={{ width: "50px", height: "50px", background: theme == "light" ? "var(--border-primary-gray)" : "#363636", borderRadius: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <CameraIcon fillColor="var(--bg-primary-green)" width={32} height={32} />
                                    </div>
                                    <p style={{ marginTop: "0px" }}>{translate('visit_take_picture', language)}</p>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <ButtonFixBottom needBorderTop={true}>
                    {isLoadingSubmit ? (
                        <CustomButton
                            color={"white"}
                            bg={"var(--color-gray)"}
                            text={"Loading..."}
                            disable={true}
                        />
                    ) : (
                        <CustomButton
                            color={"white"}
                            bg={isButtonEnabled ? "var(--bg-primary-green)" : "var(--color-gray)"}
                            text={translate('submit', language)}
                            disable={!isButtonEnabled}
                            handleClick={handleSubmit}
                        />
                    )}
                </ButtonFixBottom>
            </Block>

            <TypePopup
                title={translate("procurement_select_submission_type", language)}
                top={"60%"}
                height={"75vh"}
                opened={typePopupOpened}
                onClose={closeTypePopup}
                options={submissionTypes}
                onSelect={(selectedType, index) => {
                    setReimburseType(selectedType);
                    setSelectedIndex(index)
                    closeTypePopup();
                }}
            />

            <ProofPopup
                title={translate('reimburse_proof', language)}
                opened={popupOpened}
                onClose={closePopup}
                onViewImage={openFullImagePopup}
                onReplaceImage={handleReplaceProof}
                onDeleteImage={handleDeleteProof}
            />

            <FullImagePopup
                opened={fullImagePopupOpened}
                onClose={closeFullImagePopup}
                imageSrc={reimburseProofImage}
            />

            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={translate('submission_success', language)}
                message={translate('submission_reimburse_success_text', language)}
                imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
            />

            <UploadPicturePopup
                sheetOpened={sheetPictureOpened}
                setSheetOpened={setSheetPictureOpened}
                title={translate('reimburse_proof', language)}
                capturePhotoHandler={capturePhotoHandler}
            />
        </Page>
    );
}

export default ReimburseSubmission;
