import { Button, f7, Page } from 'framework7-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { API } from '../../../../api/axios';
import { selectSettings } from '../../../../slices/settingsSlice';
import { selectLanguages } from '../../../../slices/languagesSlice';
import BackButton from '../../../../components/backButton';
import TypePopup from '../../../../components/typePopup';
import { translate } from '../../../../utils/translate';
import { showToastFailed } from '../../../../functions/toast';
import MessageAlert from '../../../../components/messageAlert';
import { FaRegClock } from 'react-icons/fa6';
import { LuMapPin } from 'react-icons/lu';
import ButtonFixBottom from '../../../../components/buttonFixBottom';
import CustomButton from '../../../../components/customButton';
import InputText from '../../../../components/inputText';
import InputDate from '../../../../components/inputDate';
import { FaChevronRight } from 'react-icons/fa';
import InputTime from '../../../../components/inputTime';
import InputDropdown from '../../../../components/inputDropdown';
import InputTextarea from '../../../../components/inputTextarea';
import ImageAlertLight from '../../../../assets/messageAlert/absen-light.png'
import ImageAlertDark from '../../../../assets/messageAlert/absen-dark.png'

const AddSchedule = () => {
    const today = new Date().toISOString().split("T")[0];
    const getDate = localStorage.getItem('addScheduleDate')
    const [eventName, setEventName] = useState("");
    const [scheduleDate, setScheduleDate] = useState(getDate ? getDate : today);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [recurrenceType, setRecurrenceType] = useState("");
    const [recurrenceValue, setRecurrenceValue] = useState("");
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [typePopupOpened, setTypePopupOpened] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [sheetOpened, setSheetOpened] = useState(false);

    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const token = localStorage.getItem("token");

    const recurrenceOptions = [
        { value: "once", label: translate('once', language) },
        { value: "daily", label: translate('daily', language) },
        { value: "weekly", label: translate('weekly', language) },
        { value: "monthly", label: translate('monthly', language) },
    ];

    const openTypePopup = () => setTypePopupOpened(true);
    const closeTypePopup = () => setTypePopupOpened(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoadingSubmit(true);

        if (!eventName || !scheduleDate || !startTime || !endTime || !recurrenceType) {
            showToastFailed("Harap lengkapi semua field yang wajib diisi");
            setIsLoadingSubmit(false);
            return;
        }

        if (startTime >= endTime) {
            showToastFailed("Jam selesai harus lebih dari jam mulai");
            setIsLoadingSubmit(false);
            return;
        }

        const startDateTime = new Date(`${scheduleDate}T${startTime}:00`);
        const endDateTime = new Date(`${scheduleDate}T${endTime}:00`);

        const scheduleRequest = {
            event_name: eventName,
            start_date: startDateTime.toISOString(),
            end_date: endDateTime.toISOString(),
            recurrence_type: recurrenceValue,
            address: address,
            notes: notes || ""
        };

        try {
            const response = await API.post("/user-schedules", scheduleRequest);

            console.log("response submit schedule:", response);
            f7.views.main.router.back({ force: true });
            setSheetOpened(true);
        } catch (error) {
            showToastFailed(translate('failed_create_schedule', language) + ". " + (error.response?.data?.message || error.message || "Unknown error"));
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const isButtonEnabled = eventName && scheduleDate && startTime && endTime && recurrenceType;

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "0 15px", marginBottom: "110px", marginTop: "5px", color: theme == "light" ? "black" : "white" }}>
                <BackButton label={translate('add_schedule', language)} />

                <form onSubmit={handleSubmit} style={{ fontSize: "var(--font-sm)" }}>
                    <InputText
                        type={"text"}
                        id={"eventName"}
                        value={eventName}
                        onChange={handleInputChange(setEventName)}
                        title={translate('detail_permission_type', language)}
                        placeholder={translate('add_schedule_title_text', language)}
                        theme={theme}
                    />

                    <InputDate
                        title={translate('add_schedule_date', language)}
                        id={"scheduleDate"}
                        value={scheduleDate}
                        noValue={translate("schedule_set_date", language)}
                        onChange={handleInputChange(setScheduleDate)}
                        language={language}
                        theme={theme}
                    />

                    <InputTime
                        title={translate('add_schedule_time_start', language)}
                        id={"startTime"}
                        value={startTime}
                        noValue={translate("add_schedule_time_start_text", language)}
                        onChange={handleInputChange(setStartTime)}
                        theme={theme}
                    />

                    <InputTime
                        title={translate('add_schedule_time_end', language)}
                        id={"endTime"}
                        value={endTime}
                        noValue={translate("add_schedule_time_end_text", language)}
                        onChange={handleInputChange(setEndTime)}
                        theme={theme}
                    />

                    <InputDropdown
                        title={translate('add_schedule_repetition', language)}
                        value={recurrenceType}
                        noValue={translate('add_schedule_repetition_text', language)}
                        onClick={openTypePopup}
                        theme={theme}
                    />

                    <InputText
                        type={"text"}
                        id={"address"}
                        value={address}
                        onChange={handleInputChange(setAddress)}
                        title={translate('add_schedule_address', language)}
                        placeholder={translate('add_schedule_address_text', language)}
                        icon={<LuMapPin size={"17px"} style={{ color: "var(--bg-primary-green)" }} />}
                        theme={theme}
                    />

                    <InputTextarea
                        title={translate('add_schedule_notes', language)}
                        id={"notes"}
                        type={"label"}
                        noMargin={false}
                        placeholder={translate('add_schedule_notes_text', language)}
                        value={notes}
                        onChange={handleInputChange(setNotes)}
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
                        bg={isButtonEnabled ? "var(--bg-primary-green)" : "var(--color-gray)"}
                        text={translate('create_schedule', language)}
                        disable={!isButtonEnabled}
                        handleClick={handleSubmit}
                    />
                )}
            </ButtonFixBottom>

            <TypePopup
                title={translate("add_schedule_repetition_text", language)}
                top={"20%"}
                height={"68vh"}
                opened={typePopupOpened}
                onClose={closeTypePopup}
                options={recurrenceOptions.map(option => option.label)}
                onSelect={(selectedLabel, index) => {
                    const selectedOption = recurrenceOptions[index];
                    setRecurrenceType(selectedLabel);
                    setRecurrenceValue(selectedOption.value);
                    closeTypePopup();
                }}
            />

            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={translate('success_create_schedule', language)}
                message={translate('success_create_schedule_text', language)}
                imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
            />
        </Page>
    );
};

export default AddSchedule;