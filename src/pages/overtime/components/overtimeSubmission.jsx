import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { f7, Page } from 'framework7-react';
import { translate } from '../../../utils/translate';
import TypePopup from '../../../components/typePopup';
import BackButton from '../../../components/backButton';
import { API } from '../../../api/axios';
import Loading from '../../../components/loading';
import { showToastFailed } from '../../../functions/toast';
import MessageAlert from '../../../components/messageAlert';
import ButtonFixBottom from '../../../components/buttonFixBottom';
import CustomButton from '../../../components/customButton';
import CustomPopup from '../../../components/customPopup';
import InputDate from '../../../components/inputDate';
import InputTime from '../../../components/inputTime';
import InputDropdown from '../../../components/inputDropdown';
import InputTextarea from '../../../components/inputTextarea';
import ImageAlertLight from '../../../assets/messageAlert/overtime-light.png'
import ImageAlertDark from '../../../assets/messageAlert/overtime-dark.png'

const OvertimeSubmission = () => {
    const [overtimeType, setOvetimeType] = useState(null);
    const [overtimeDate, setOvertimeDate] = useState(null);
    const [overtimeStart, setOvertimeStart] = useState(null);
    const [overtimeEnd, setOvertimeEnd] = useState(null);
    const [overtimeReason, setOvertimeReason] = useState(null);
    const [overtimeDescReason, setOvertimeDescReason] = useState(null);
    const [typePopupOpened, setTypePopupOpened] = useState(false);
    const [optionTypes, setOptionTypes] = useState([]);
    const [optionTypesId, setOptionTypesId] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [confirmPopupOpened, setConfirmPopupOpened] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [sheetOpened, setSheetOpened] = useState(false);
    const [kindOfType, setKindOfType] = useState('')
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);

    console.log("overtime date :", overtimeDate);
    console.log("overtime start :", overtimeStart);
    console.log("overtime end :", overtimeEnd);

    const optionReasons = [
        "Pekerjaan Mendesak",
        "Tutup Bulan (Closing)",
        "Project Khusus",
        "Pergantian Shift",
        "Permintaan Klien"
    ]

    const fetchOptionTypes = async () => {
        try {
            const response = await API.get('/type-of-overtime?limit=100&cond={"status":"active"}&sort_by=created_at+asc')
            const data = response.data.payload
            setOptionTypes(data.map(item => item.name))
            setOptionTypesId(data.map(item => item.id))
        } catch (error) {
            console.log("Data options tidak bisa diakses", error);
        }
    }

    useEffect(() => {
        setIsLoading(true)
        fetchOptionTypes()
        setIsLoading(false)
    }, [])

    const openTypePopup = (type) => {
        setKindOfType(type)
        setTypePopupOpened(true)
    };
    const closeTypePopup = () => setTypePopupOpened(false);

    const handleConfirmSubmit = () => {
        setConfirmPopupOpened(true)
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoadingSubmit(true)

        if (!overtimeType || !overtimeDate || !overtimeStart || !overtimeEnd || !overtimeReason || !overtimeDescReason) {
            // f7.dialog.alert(translate('reimburse_submit_unfilled', language));
            showToastFailed(translate('reimburse_submit_unfilled', language))
            return;
        }

        const tzOffset = '+07:00';

        const startISO = `${overtimeDate}T${overtimeStart}:00${tzOffset}`;
        const endISO = `${overtimeDate}T${overtimeEnd}:00${tzOffset}`;

        const overtimeRequest = {
            type_of_overtime: optionTypesId[selectedIndex],
            start_date: startISO,
            start_overtime: startISO,
            end_overtime: endISO,
            reason_category: overtimeReason,
            reason: overtimeDescReason,
        };

        try {
            const response = await API.post("/mobile/form-request-overtime", overtimeRequest);

            console.log("response submit :", response);
            // f7.dialog.alert("Pengajuan Lembur Berhasil!", () => f7.views.main.router.back('/overtime/', { reloadCurrent: true, reloadAll: true }));
            f7.views.main.router.back('/overtime/', { reloadCurrent: true, reloadAll: true })
            // showToast("Pengajuan Lembur Berhasil!", theme)
            setSheetOpened(true)
        } catch (error) {
            // f7.dialog.alert("Pengajuan Lembur Gagal! " +
            //     (error.response?.data?.message || error.message || "Unknown error"));
            // console.log("error :", error);
            showToastFailed(translate('request_overtime_failed', language) + ": " + error)
        } finally {
            setIsLoadingSubmit(false)
            setConfirmPopupOpened(false)
        }
    }

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const handleOnSelect = (selectedType, index) => {
        if (kindOfType == "reason") {
            setOvertimeReason(selectedType)
        } else {
            setOvetimeType(selectedType);
            setSelectedIndex(index)
        }
        closeTypePopup();
    }

    const isButtonEnabled = overtimeType && overtimeReason && overtimeStart && overtimeEnd && overtimeDescReason;

    if (isLoading) {
        return (
            <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
                <Loading />
            </Page>
        )
    }

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ color: theme === "light" ? "black" : "white" }}>
                <div style={{ padding: "0 15px", marginBottom: "90px" }}>
                    <BackButton label={translate('overtime_submission', language)} />

                    <form onSubmit={handleConfirmSubmit} style={{ fontSize: "var(--font-sm)" }}>
                        <InputDropdown
                            title={translate('overtime_type', language)}
                            value={overtimeType}
                            noValue={translate('overtime_type_select', language)}
                            onClick={() => openTypePopup("type")}
                            theme={theme}
                        />

                        <InputDate
                            title={translate('overtime_date', language)}
                            id={"overtimeDate"}
                            value={overtimeDate}
                            noValue={translate("overtime_date_text", language)}
                            onChange={handleInputChange(setOvertimeDate)}
                            language={language}
                            theme={theme}
                        />

                        <InputTime
                            title={translate('start_hour', language)}
                            id={"startHour"}
                            value={overtimeStart}
                            noValue={translate("overtime_start_hour_text", language)}
                            onChange={handleInputChange(setOvertimeStart)}
                            theme={theme}
                        />

                        <InputTime
                            title={translate('end_hour', language)}
                            id={"endHour"}
                            value={overtimeEnd}
                            noValue={translate("overtime_end_hour_text", language)}
                            onChange={handleInputChange(setOvertimeEnd)}
                            theme={theme}
                        />

                        <InputDropdown
                            title={translate('overtime_reason', language)}
                            value={overtimeReason}
                            noValue={translate('overtime_reason_select', language)}
                            onClick={() => openTypePopup("reason")}
                            theme={theme}
                        />

                        <InputTextarea
                            title={translate('submission_permission_note', language)}
                            id={"overtimeDescReason"}
                            type={"label"}
                            noMargin={false}
                            placeholder={translate('overtime_desc_reason_text', language)}
                            value={overtimeDescReason}
                            onChange={handleInputChange(setOvertimeDescReason)}
                            theme={theme}
                        />
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
                            bg={(!isButtonEnabled || isLoadingSubmit) ? "var(--color-gray)" : "var(--bg-primary-green)"}
                            text={isLoadingSubmit ? "Loading..." : translate('overtime_request_create', language)}
                            disable={!isButtonEnabled || isLoadingSubmit}
                            handleClick={handleConfirmSubmit}
                        />
                    )}
                </ButtonFixBottom>
            </div>

            <TypePopup
                title={kindOfType == "reason" ? translate('overtime_reason_select', language) : translate('overtime_type_select', language)}
                opened={typePopupOpened}
                onClose={closeTypePopup}
                options={kindOfType == "reason" ? optionReasons : optionTypes}
                onSelect={handleOnSelect}
            />

            <CustomPopup
                popupOpened={confirmPopupOpened}
                setPopupOpened={() => setConfirmPopupOpened(false)}
                title={translate('overtime_confirm', language)}
                message={translate('overtime_confirm_text', language)}
                btnNo={translate('procurement_cancel', language)}
                handleCancel={() => setConfirmPopupOpened(false)}
                btnYes={translate('submit_overtime', language)}
                handleConfirm={handleSubmit}
            />

            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={translate('submission_success', language)}
                message={translate('submission_overtime_success_text', language)}
                imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
            />
        </Page>
    );
}

export default OvertimeSubmission;