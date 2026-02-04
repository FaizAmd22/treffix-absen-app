import React, { useEffect, useState } from 'react'
import { Button } from 'framework7-react';
import { useSelector } from 'react-redux';
import TypePopup from '../../../../../components/typePopup';
import FullImagePopup from '../../../../../components/fullImagePopup';
import { selectSettings } from '../../../../../slices/settingsSlice';
import { selectUser } from '../../../../../slices/userSlice';
import { selectLanguages } from '../../../../../slices/languagesSlice';
import ProofPopupPersonal from './proofPopupPersonal';
import { translate } from '../../../../../utils/translate';
import Loading from '../../../../../components/loading';
import { FaRegFilePdf } from "react-icons/fa6";
import { PdfViewer } from '../../../../../components/pdfViewer';
import { religionOptions, bloodTypeOptions, maritalStatusOptions, genderOptions } from '../../../../../utils/selectOptions';
import { findLabelFromValue } from '../../../../../functions/findLabelFromValue';
import { findValueFromLabel } from '../../../../../functions/findValueFromLabel';
import InputDropdown from '../../../../../components/inputDropdown';
import InputDate from '../../../../../components/inputDate';
import InputText from '../../../../../components/inputText';
import InputNumber from '../../../../../components/inputNumber';
import InputTextarea from '../../../../../components/inputTextarea';

const PersonalComponent = ({ data, isLoading, setDataSubmit, isUpdate }) => {
    const [formData, setFormData] = useState({
        identity_number: null,
        family_card_number: null,
        birth_place: null,
        date_of_birth: null,
        gender: null,
        marital_status: null,
        blood_type: null,
        religion: null,
        address: null,
        domicile_address: null
    });

    const [displayData, setDisplayData] = useState({
        gender: null,
        marital_status: null,
        blood_type: null,
        religion: null
    });

    const [ktpImage, setKtpImage] = useState(null);
    const [ktpDocType, setKtpDocType] = useState('image');
    const [popupOpened, setPopupOpened] = useState(false);
    const [fullImagePopupOpened, setFullImagePopupOpened] = useState(false);
    const [typePopupOpened, setTypePopupOpened] = useState(false);
    const [pdfViewerOpened, setPdfViewerOpened] = useState(false);
    const [types, setTypes] = useState(null);

    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const user = useSelector(selectUser);

    console.log("formData di personal:", formData);
    console.log("data di personal:", data);

    const getDocumentType = (url) => {
        if (!url) return null;

        if (url.toLowerCase().includes('.pdf')) return 'pdf';
        if (url.toLowerCase().includes('.png') ||
            url.toLowerCase().includes('.jpg') ||
            url.toLowerCase().includes('.jpeg') ||
            url.toLowerCase().includes('.gif')) return 'image';

        return 'image';
    };

    const initializeData = (data) => {
        if (data) {
            const genderLabel = findLabelFromValue(genderOptions, data.gender);
            const maritalLabel = findLabelFromValue(maritalStatusOptions, data.marital_status);
            const bloodLabel = findLabelFromValue(bloodTypeOptions, data.blood_type);
            const religionLabel = findLabelFromValue(religionOptions, data.religion);

            setFormData({
                identity_number: data.identity_number || null,
                family_card_number: data.family_card_number || null,
                birth_place: data.birth_place || null,
                date_of_birth: data.date_of_birth || null,
                gender: data.gender || null,
                marital_status: data.marital_status || null,
                blood_type: data.blood_type || null,
                religion: data.religion || null,
                address: data.address || null,
                domicile_address: data.domicile_address || null
            });

            const getKtp = data?.documents?.find(item => item.document_type == "identity_card");
            if (getKtp) {
                setKtpImage(getKtp.document_url);
                setKtpDocType(getDocumentType(getKtp.document_url));
            } else {
                setKtpImage(null);
                setKtpDocType('image');
            }

            setDisplayData({
                gender: genderLabel,
                marital_status: maritalLabel,
                blood_type: bloodLabel,
                religion: religionLabel
            });
        }
    };

    useEffect(() => {
        initializeData(data);
    }, [data]);

    useEffect(() => {
        if (!isUpdate) {
            initializeData(data);
        }
    }, [isUpdate, data]);

    useEffect(() => {
        setDataSubmit(formData);
    }, [formData, setDataSubmit]);

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const openPopup = () => {
        if (ktpDocType === 'pdf') {
            setPdfViewerOpened(true);
            return;
        }
        setPopupOpened(true);
    };

    const closePopup = () => setPopupOpened(false);
    const closePdfViewer = () => setPdfViewerOpened(false);

    const openFullImagePopup = () => {
        setFullImagePopupOpened(true);
        setPopupOpened(false);
    };

    const closeFullImagePopup = () => {
        setFullImagePopupOpened(false);
    };

    const getOptionsForType = (type) => {
        let optionsArray = [];
        switch (type) {
            case "marital_status":
                optionsArray = maritalStatusOptions.map(opt => opt.label);
                break;
            case "blood_type":
                optionsArray = bloodTypeOptions.map(opt => opt.label);
                break;
            case "religion":
                optionsArray = religionOptions.map(opt => opt.label);
                break;
            default:
                optionsArray = [];
        }
        return optionsArray;
    };

    const tops = types === "marital_status" ? "62%" : types === "blood_type" ? "62%" : "45%";

    const openTypePopup = (type) => {
        setTypes(type);
        setTypePopupOpened(true);
    };

    const closeTypePopup = () => setTypePopupOpened(false);

    const onSelect = (selectedLabel) => {
        setDisplayData((prev) => ({
            ...prev,
            [types]: selectedLabel
        }));

        let value = selectedLabel;
        switch (types) {
            case "marital_status":
                value = findValueFromLabel(maritalStatusOptions, selectedLabel);
                break;
            case "blood_type":
                value = findValueFromLabel(bloodTypeOptions, selectedLabel);
                break;
            case "religion":
                value = findValueFromLabel(religionOptions, selectedLabel);
                break;
        }

        setFormData((prev) => ({
            ...prev,
            [types]: value
        }));

        closeTypePopup();
    };

    const renderKtpThumbnail = () => {
        if (ktpDocType === 'pdf') {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme === "light" ? '#f5f5f5' : '#2c2c2c',
                    borderRadius: '8px'
                }}>
                    <FaRegFilePdf size="40px" style={{ color: "var(--color-red)" }} />
                    <div style={{
                        marginTop: '8px',
                        fontSize: '14px',
                        color: theme === "light" ? '#333' : '#ddd'
                    }}>
                        Tap to view PDF
                    </div>
                </div>
            );
        } else {
            return (
                <img
                    src={ktpImage}
                    alt="uploaded"
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24'%3E%3Cpath fill='%23757575' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                    }}
                />
            );
        }
    };

    const handleTypePopup = (type) => {
        if (isUpdate) {
            openTypePopup(type)
        }
    }

    if (isLoading) {
        return <Loading height="80vh" />;
    }


    return (
        <div>
            <form style={{ fontSize: "var(--font-sm)", marginTop: "20px" }}>
                <p style={{ fontWeight: "600" }} htmlFor="ktp">{translate('upload_ktp', language)}</p>

                {ktpImage && (
                    <div style={{ display: "flex", alignItems: "center", borderRadius: "8px", padding: "10px", position: "relative", width: "100%", height: "100px", marginBottom: "40px" }}>
                        <Button
                            onClick={openPopup}
                            style={{ width: "100%", height: "150px", marginTop: "32px", marginLeft: "-10px", borderRadius: "8px", padding: 0, border: "none", textTransform: "capitalize" }}>
                            {renderKtpThumbnail()}
                        </Button>
                    </div>
                )}

                <InputText
                    title={translate('ktp_number', language)}
                    value={formData.identity_number}
                    id={"ktp_number"}
                    disabled={true}
                    theme={theme}
                />

                <InputNumber
                    title={translate('kk_number', language)}
                    id={"kkNumber"}
                    value={formData.family_card_number}
                    placeholder={translate('kk_number_text', language)}
                    onChange={handleChange("family_card_number")}
                    disabled={!isUpdate}
                    theme={theme}
                />

                <InputText
                    type={"text"}
                    id={"birthplace"}
                    value={formData.birth_place || ''}
                    onChange={handleChange("birth_place")}
                    isUpdate={isUpdate}
                    title={translate("birthplace", language)}
                    placeholder={translate('birthplace_text', language)}
                    theme={theme}
                />

                <InputDate
                    title={translate('date_of_birth', language)}
                    id={"birthdate"}
                    value={formData.date_of_birth}
                    noValue={translate("date_of_birth_text", language)}
                    onChange={handleChange("date_of_birth")}
                    language={language}
                    theme={theme}
                    disabled={!isUpdate}
                />

                <InputText
                    title={translate('gender', language)}
                    value={displayData.gender || formData.gender}
                    id={"gender"}
                    disabled={true}
                    theme={theme}
                />

                <InputDropdown
                    title={translate('marital_status', language)}
                    value={displayData.marital_status}
                    noValue={translate('select_here', language)}
                    onClick={() => handleTypePopup("marital_status")}
                    isUpdate={!isUpdate}
                    theme={theme}
                />

                <InputDropdown
                    title={translate('blood_type', language)}
                    value={displayData.blood_type}
                    noValue={translate('select_here', language)}
                    onClick={() => handleTypePopup("blood_type")}
                    isUpdate={!isUpdate}
                    theme={theme}
                />

                <InputDropdown
                    title={translate('religion', language)}
                    value={displayData.religion}
                    noValue={translate('select_here', language)}
                    onClick={() => handleTypePopup("religion")}
                    isUpdate={!isUpdate}
                    theme={theme}
                />

                <InputTextarea
                    title={translate('full_address', language)}
                    id={"address"}
                    type={"label"}
                    noMargin={false}
                    placeholder={translate('full_address_text', language)}
                    value={formData.address || ''}
                    onChange={handleChange("address")}
                    disabled={!isUpdate}
                    theme={theme}
                />

                <InputTextarea
                    title={translate('domicile_address', language)}
                    id={"domicileAddress"}
                    type={"label"}
                    noMargin={false}
                    placeholder={translate('domicile_address_text', language)}
                    value={formData.domicile_address || ''}
                    onChange={handleChange("domicile_address")}
                    disabled={!isUpdate}
                    theme={theme}
                />
            </form>

            <TypePopup
                top={tops}
                opened={typePopupOpened}
                onClose={closeTypePopup}
                options={getOptionsForType(types)}
                onSelect={onSelect}
                title={types ? translate(types, language) : ""}
            />

            {ktpDocType === 'image' && (
                <>
                    <ProofPopupPersonal
                        title="KTP"
                        opened={popupOpened}
                        onClose={closePopup}
                        onViewImage={openFullImagePopup}
                    />

                    <FullImagePopup
                        opened={fullImagePopupOpened}
                        onClose={closeFullImagePopup}
                        imageSrc={ktpImage}
                        documentType={ktpDocType}
                    />
                </>
            )}

            {ktpDocType === 'pdf' && (
                <PdfViewer
                    pdfUrl={ktpImage}
                    title="KTP Document"
                    isOpen={pdfViewerOpened}
                    onClose={closePdfViewer}
                    theme={theme}
                />
            )}
        </div>
    )
}

export default PersonalComponent