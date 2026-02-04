import { Button, f7, Page } from 'framework7-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import BackButton from '../../../components/backButton';
import FullImagePopup from '../../../components/fullImagePopup';
import TypePopup from '../../../components/typePopup';
import ProofPopup from '../../../components/proofPopup';
import { API } from '../../../api/axios';
import { calculateDays } from '../../../functions/calculateDays';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { showToastFailed } from '../../../functions/toast';
import MessageAlert from '../../../components/messageAlert';
import UploadPicturePopup from '../../../components/uploadPicturePopup';
import { capturePhoto, uploadImageToAPI } from '../../../functions/photoUtils';
import { FaRegClock } from 'react-icons/fa6';
import Loading from '../../../components/loading';
import ButtonFixBottom from '../../../components/buttonFixBottom';
import CustomButton from '../../../components/customButton';
import InputDate from '../../../components/inputDate';
import InputDropdown from '../../../components/inputDropdown';
import InputTextarea from '../../../components/inputTextarea';
import CameraIcon from '../../../icons/camera';
import ImageAlertLight from '../../../assets/messageAlert/permission-light.png'
import ImageAlertDark from '../../../assets/messageAlert/permission-dark.png'

const PermissionSubmission = () => {
    const [documentFileImage, setDocumentFileImage] = useState(null);
    const [docPopupOpened, setDocPopupOpened] = useState(false);
    const [fullImagePopupOpened, setFullImagePopupOpened] = useState(false);
    const [submissionType, setSubmissionType] = useState("");
    const [submissionTypeId, setSubmissionTypeId] = useState("");
    const [submissionDateStart, setSubmissionDateStart] = useState("");
    const [submissionDateEnd, setSubmissionDateEnd] = useState("");
    const [submissionReason, setSubmissionReason] = useState("");
    const [typePopupOpened, setTypePopupOpened] = useState(false);
    const [sheetPictureOpened, setSheetPictureOpened] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [isEndDateDisabled, setIsEndDateDisabled] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [sheetOpened, setSheetOpened] = useState(false);
    const [submissionDuration, setSubmissionDuration] = useState(0);
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages)
    const token = localStorage.getItem("token")
    const hasLeaveBalance = localStorage.getItem("hasLeaveBalance")

    const FIXED_END_DATE_CODES = ['CBA', 'CIM', 'CKA', 'CKM', 'CMA', 'CKMSR', 'CM'];

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await API.get("/type-of-leave", {
                    params: {
                        page: 1,
                        sort_by: "created_at asc",
                        limit: 100,
                    },
                });

                console.log("permission category :", response.data.payload);
                setLeaveTypes(response.data.payload);
            } catch (error) {
                console.log("Data options tidak bisa diakses", error);
            }
        };

        if (token) {
            fetchOptions();
        }
    }, [token]);

    const calculateEndDate = (startDate, leaveTypeCode) => {
        if (!startDate) return "";

        const start = new Date(startDate);
        let end = new Date(start);

        switch (leaveTypeCode) {
            case 'CBA':
            case 'CIM':
            case 'CKA':
            case 'CKM':
            case 'CMA':
                end.setDate(start.getDate() + 1);
                break;
            case 'CKMSR':
            case 'CM':
                end.setDate(start.getDate() + 2);
                break;
            default:
                return startDate;
        }

        return end.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (submissionTypeId) {
            const selectedLeaveType = leaveTypes.find(type => type.id === submissionTypeId);
            if (selectedLeaveType) {
                const isFixedEndDate = FIXED_END_DATE_CODES.includes(selectedLeaveType.code);
                setIsEndDateDisabled(isFixedEndDate);

                if (submissionDateStart) {
                    const autoEndDate = isFixedEndDate
                        ? calculateEndDate(submissionDateStart, selectedLeaveType.code)
                        : submissionDateEnd;

                    setSubmissionDateEnd(autoEndDate);
                }
            }
        }
    }, [submissionTypeId, submissionDateStart, leaveTypes]);

    useEffect(() => {
        if (submissionDateStart && submissionDateEnd) {
            const start = new Date(submissionDateStart);
            const end = new Date(submissionDateEnd);
            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            setSubmissionDuration(duration);
        }
    }, [submissionDateStart, submissionDateEnd]);

    const openDocPopup = () => setDocPopupOpened(true);
    const closeDocPopup = () => setDocPopupOpened(false);

    const openFullImagePopup = () => setFullImagePopupOpened(true);
    const closeFullImagePopup = () => {
        setFullImagePopupOpened(false);
        setDocPopupOpened(true);
    }

    const openTypePopup = () => setTypePopupOpened(true);
    const closeTypePopup = () => setTypePopupOpened(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoadingSubmit(true)

        console.log("submissionType :", submissionType);

        if (!submissionType || !submissionDateStart || !submissionDateEnd || !submissionReason) {
            // f7.dialog.alert(translate('submission_permission_empty_input_alert', language));
            showToastFailed(translate('submission_permission_empty_input_alert', language))
            setIsLoadingSubmit(false)
            return;
        }

        if (submissionType == "Cuti Tahunan" && hasLeaveBalance == "false") {
            showToastFailed(translate('no_leave_balance', language))
            setIsLoadingSubmit(false)
            return;
        }

        const days = calculateDays(submissionDateStart, submissionDateEnd);

        const startDate = new Date(submissionDateStart);
        startDate.setHours(18, 0, 0, 0);

        const endDate = new Date(submissionDateEnd);
        endDate.setHours(18, 0, 0, 0);

        const leaveRequest = {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            type_of_leave: submissionTypeId,
            reason: submissionReason,
            proof: documentFileImage || "",
            days: days
        };

        try {
            const response = await API.post("/mobile/form-request-leave", leaveRequest, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log("response submit :", response);
            // f7.dialog.alert(translate('submission_permission_successful_submission', language), () => f7.views.main.router.back('/permission/', { reloadCurrent: true }));
            f7.views.main.router.back('/permission/', { reloadCurrent: true })
            // showToast(translate('submission_permission_successful_submission', language), theme)
            setSheetOpened(true)
        } catch (error) {
            // f7.dialog.alert(translate('submission_permission_failed_submission', language) + " " +
            //     (error.response?.data?.message || error.message || "Unknown error"));
            showToastFailed(translate('submission_permission_failed_submission', language) + ". " + (error.response?.data?.message || error.message || "Unknown error"))
        } finally {
            setIsLoadingSubmit(false)
        }
    };

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const capturePhotoHandler = (typeUpload) => {
        capturePhoto({
            onSuccess: async (fileInfo, uri) => {
                await uploadImageToAPI({
                    file: uri,
                    setImageUrl: setDocumentFileImage,
                    setUploading: setIsUploading,
                    token,
                });
            },
            onError: () => document.getElementById('documentFile').click(),
            setUploading: setIsUploading,
            typeProof: 'documentFile',
            typeUpload: typeUpload,
        });
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
            setDocumentFileImage(data.url);
        } catch (error) {
            // f7.dialog.alert(translate('submission_permission_document_upload_alert', language));
            showToastFailed(translate('submission_permission_document_upload_alert', language))
        } finally {
            setIsUploading(false)
        }
    };

    const handleDeleteDocument = () => {
        setDocumentFileImage(null);
        closeDocPopup();
    };

    const handleReplaceDocument = () => {
        document.getElementById('documentFile').click();
        closeDocPopup();
    };

    console.log("submissionType :", submissionType);


    const isButtonEnabled = React.useMemo(() => {
        const isBaseValid = submissionType && submissionDateStart && submissionDateEnd && submissionReason;

        if (submissionType === "Izin Sakit") {
            return isBaseValid && !!documentFileImage;
        }

        return isBaseValid;
    }, [submissionType, submissionDateStart, submissionDateEnd, submissionReason, documentFileImage]);


    const today = new Date().toISOString().split("T")[0];

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "0 15px", marginBottom: "160px", marginTop: "5px", color: theme == "light" ? "black" : "white" }}>
                <BackButton label={translate('submission_permission', language)} />

                <form onSubmit={handleSubmit} style={{ fontSize: "var(--font-sm)" }}>
                    <InputDropdown
                        title={translate('submission_permission_submission_type', language)}
                        value={submissionType}
                        noValue={translate('submission_permission_select_submission_type', language)}
                        onClick={openTypePopup}
                        theme={theme}
                    />

                    <InputDate
                        title={translate('start_date', language)}
                        id={"submissionStart"}
                        value={submissionDateStart}
                        noValue={translate("submission_permission_set_the_date", language)}
                        onChange={handleInputChange(setSubmissionDateStart)}
                        language={language}
                        theme={theme}
                        min={today}
                    />

                    <InputDate
                        title={translate('end_date', language)}
                        id={"submissionEnd"}
                        value={submissionDateEnd}
                        noValue={translate("submission_permission_set_the_date", language)}
                        onChange={handleInputChange(setSubmissionDateEnd)}
                        language={language}
                        theme={theme}
                        min={submissionDateStart}
                        disabled={isEndDateDisabled}
                    />

                    <label style={{ fontWeight: "600" }} htmlFor="submissionDuration">{translate('submission_permission_duration', language)}</label>
                    <div style={{
                        padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        position: "relative",
                        borderRadius: "5px",
                        marginBottom: "10px",
                        background: theme == "light" ? "#D9DADC" : "#363636",
                        border: theme === "light" ? "1px solid #E5E5E5" : "1px solid #363636"
                    }}>
                        <FaRegClock size={"17px"} style={{ color: "var(--bg-primary-green)", marginRight: "8px" }} />
                        {submissionDuration} {translate('days', language)}
                    </div>

                    <InputTextarea
                        title={translate('reason_for_submission', language)}
                        id={"submissionReason"}
                        type={"label"}
                        noMargin={false}
                        placeholder={translate('submission_permission_reason_placeholder', language)}
                        value={submissionReason}
                        onChange={handleInputChange(setSubmissionReason)}
                        theme={theme}
                    />

                    <label style={{ fontWeight: "600" }} htmlFor="documentFile">{translate('submission_permission_supporting_documents', language)}</label>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "5px",
                        padding: "10px",
                        position: "relative",
                        width: "100%",
                        height: "150px"
                    }}>
                        <input
                            type="file"
                            id="documentFile"
                            onChange={handleDocumentChange}
                            style={{ display: "none" }}
                            accept='.jpg, .png, .jpeg'
                        />
                        {documentFileImage ? (
                            <Button
                                type="button"
                                onClick={openDocPopup}
                                style={{
                                    width: "100%",
                                    height: "200px",
                                    marginLeft: "-10px",
                                    borderRadius: "5px",
                                    marginTop: "40px",
                                    padding: 0,
                                    border: "none"
                                }}
                            >
                                <img src={documentFileImage} alt="uploaded" style={{
                                    width: "100%",
                                    height: "200px",
                                    objectFit: "cover",
                                    borderRadius: "5px"
                                }} />
                            </Button>
                        ) : isUploading ? (
                            <div style={{ width: "100%", marginTop: "70px", marginLeft: "-10px", marginRight: "10px" }}>
                                <div style={{ width: "100%", height: "150px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", cursor: "pointer", borderRadius: "5px", border: theme === "light" ? "1px solid #E5E5E5" : "1px solid #363636" }}>
                                    <Loading height={"100%"} />
                                </div>
                            </div>
                        ) : (
                            <div style={{ marginTop: "70px", marginLeft: "-10px", marginRight: "10px" }}>
                                <div
                                    onClick={() => setSheetPictureOpened(true)}
                                    style={{ height: "150px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", cursor: "pointer", borderRadius: "5px", border: theme === "light" ? "1px solid #E5E5E5" : "1px solid #363636" }}>
                                    <div style={{ width: "50px", height: "50px", background: theme == "light" ? "var(--border-primary-gray)" : "#212121", borderRadius: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <CameraIcon fillColor="var(--bg-primary-green)" width={30} height={30} />
                                    </div>
                                    <p style={{ marginTop: "0px" }}>{translate('submission_permission_upload_documents', language)}</p>
                                </div>

                                <div style={{ display: "flex", gap: "5px", fontSize: "var(--font-xs)", fontWeight: 400 }}>
                                    <p>{translate('submission_permission_note', language)}: </p>
                                    <p>{translate('submission_permission_note_text', language)}</p>
                                </div>
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

            <TypePopup
                title={translate("procurement_select_submission_type", language)}
                top={"20%"}
                height={"68vh"}
                opened={typePopupOpened}
                onClose={closeTypePopup}
                options={leaveTypes.map(type => type.name)}
                onSelect={(selectedType, index) => {
                    const selectedLeaveType = leaveTypes[index];

                    setSubmissionType(selectedType);
                    setSubmissionTypeId(selectedLeaveType.id);

                    const isFixedEndDate = FIXED_END_DATE_CODES.includes(selectedLeaveType.code);
                    setIsEndDateDisabled(isFixedEndDate);

                    if (submissionDateStart && isFixedEndDate) {
                        const autoEndDate = calculateEndDate(submissionDateStart, selectedLeaveType.code);
                        setSubmissionDateEnd(autoEndDate);
                    }

                    closeTypePopup();
                }}

            />

            <ProofPopup
                title={translate('submission_permission_support_documents', language)}
                opened={docPopupOpened}
                onClose={closeDocPopup}
                onViewImage={openFullImagePopup}
                onReplaceImage={handleReplaceDocument}
                onDeleteImage={handleDeleteDocument}
            />

            <FullImagePopup
                opened={fullImagePopupOpened}
                onClose={closeFullImagePopup}
                imageSrc={documentFileImage}
            />

            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={translate('submission_success', language)}
                message={translate('submission_permission_success_text', language)}
                imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
            />

            <UploadPicturePopup
                sheetOpened={sheetPictureOpened}
                setSheetOpened={setSheetPictureOpened}
                title={translate('detail_permission_proof_of_submission', language)}
                capturePhotoHandler={capturePhotoHandler}
            />
        </Page>
    );
};

export default PermissionSubmission;
