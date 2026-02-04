import { Page } from "framework7-react";
import { useEffect, useMemo, useState } from "react";
import BackButton from "../../../../components/backButton";
import TypePopup from "../../../../components/typePopup";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../slices/settingsSlice";
import { MdNavigateNext } from "react-icons/md";
import PersonalComponent from "./components/personalComponent";
import KontakDarurat from "./components/kontakDarurat";
import DataPasangan from "./components/dataPasangan";
import DataAnak from "./components/dataAnak";
import BerkasKaryawan from "./components/berkasKaryawan";
import { translate } from "../../../../utils/translate";
import { selectLanguages } from "../../../../slices/languagesSlice";
import { API } from "../../../../api/axios";
import SocialMedia from "./components/socialMedia";
import { showToast, showToastFailed } from "../../../../functions/toast";
import { FaEdit } from "react-icons/fa";
import ButtonFixBottom from "../../../../components/buttonFixBottom";
import CustomButton from "../../../../components/customButton";

const LOCAL_KEY = "submissionTypeKey";
const SUBMISSION_KEYS = [
    "profile_personal_data",
    "social_media",
    "emergency_contact",
    "partner_data",
    "childrens_data",
    "employee_files",
];

const isValidKey = (v) => {
    return SUBMISSION_KEYS.includes(v);
}

const DEFAULT_KEY = "profile_personal_data";

const DataPersonal = () => {
    const [dataPersonal, setDataPersonal] = useState([]);
    const [originalDataPersonal, setOriginalDataPersonal] = useState([]);
    const [dataSubmit, setDataSubmit] = useState([]);
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);

    const [submissionTypeKey, setSubmissionTypeKey] = useState(DEFAULT_KEY);

    const [typePopupOpened, setTypePopupOpened] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isFetch, setIsFetch] = useState(false);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const submissionTypeLabel = useMemo(
        () => translate(submissionTypeKey, language),
        [submissionTypeKey, language]
    );

    const submissionTypes = useMemo(
        () => SUBMISSION_KEYS.map((k) => translate(k, language)),
        [language]
    );

    const openTypePopup = () => setTypePopupOpened(true);
    const closeTypePopup = () => setTypePopupOpened(false);

    const fetchPersonal = async () => {
        setIsLoading(true);
        try {
            const response = await API.get("/mobile/employees/personal");
            // const responseSteps = await API.get("/mobile/employees/onboarding/steps");

            const data = response.data.payload || [];
            setDataPersonal(data);
            setOriginalDataPersonal(data);
            setIsFetch(false);
        } catch (error) {
            console.log("Data request tidak bisa diakses", error);
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    }

    useEffect(() => {
        const stored = localStorage.getItem(LOCAL_KEY);
        if (stored && isValidKey(stored)) {
            setSubmissionTypeKey(stored);
            return;
        }
        if (stored) {
            const idx = SUBMISSION_KEYS.findIndex((k) => translate(k, language) === stored);
            if (idx >= 0) {
                setSubmissionTypeKey(SUBMISSION_KEYS[idx]);
                localStorage.setItem(LOCAL_KEY, SUBMISSION_KEYS[idx]);
            }
        }
    }, []);

    useEffect(() => {
        if (token || isFetch) fetchPersonal();
    }, [token, isFetch]);

    const onRefresh = (done) => {
        fetchPersonal();
        setTimeout(() => done(), 500);
    }

    const handleSubmit = async () => {
        setIsLoadingSubmit(true);
        let url = "";

        switch (submissionTypeKey) {
            case "profile_personal_data":
                url = "/mobile/employees/personal/profile";
                break;
            case "social_media":
                url = "/mobile/employees/personal/social-media";
                break;
            case "emergency_contact":
                url = "/mobile/employees/personal/emergency-contact";
                break;
            case "partner_data":
                url = "/mobile/employees/personal/spouse";
                break;
            case "childrens_data":
                url = "/mobile/employees/personal/children";
                break;
            case "employee_files":
                break;
            default:
                console.error("Unknown submission type");
                setIsLoadingSubmit(false);
                setIsUpdate(false);
                return;
        }

        try {
            if (url) {
                const response = await API.put(url, dataSubmit);
                console.log("Submit success:", response.data);
                setIsFetch(true);
                showToast(translate("data_save_success", language), theme);
            }
        } catch (error) {
            console.error("Submit failed:", error);
            showToastFailed(translate("data_save_failed", language));
        } finally {
            setIsLoadingSubmit(false);
            setIsUpdate(false);
        }
    }

    const handleCancel = () => {
        setDataPersonal(originalDataPersonal);
        setIsUpdate(false);
    }

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} ptr ptrMousewheel onPtrRefresh={onRefresh}>
            <div
                style={{
                    padding: "15px",
                    paddingTop: "25px",
                    marginBottom: "80px",
                    color: theme === "light" ? "black" : "white",
                    overflowX: "hidden",
                }}
            >
                <BackButton label={translate("profile_personal_data", language)} />

                <div style={{ marginBottom: "20px", fontSize: "var(--font-sm)" }}>
                    <div
                        onClick={openTypePopup}
                        style={{
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: theme === "light" ? "1px solid #ccc" : "1px solid #363636",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        {submissionTypeLabel}
                        <MdNavigateNext size={"18px"} color="var(--bg-primary-green)" />
                    </div>

                    {submissionTypeKey === "profile_personal_data" && (
                        <PersonalComponent
                            data={dataPersonal}
                            isLoading={isLoading}
                            setDataSubmit={setDataSubmit}
                            isUpdate={isUpdate}
                        />
                    )}

                    {submissionTypeKey === "social_media" && (
                        <SocialMedia
                            data={dataPersonal?.social_medias}
                            setDataSubmit={setDataSubmit}
                            isLoadingSubmit={isLoadingSubmit}
                            isUpdate={isUpdate}
                            key={`social-${isUpdate}-${JSON.stringify(dataPersonal?.social_medias || [])}`}
                        />
                    )}

                    {submissionTypeKey === "emergency_contact" && (
                        <KontakDarurat
                            data={dataPersonal}
                            setDataSubmit={setDataSubmit}
                            isLoadingSubmit={isLoadingSubmit}
                            isUpdate={isUpdate}
                            key={`emergency-${isUpdate}-${JSON.stringify(dataPersonal || {})}`}
                        />
                    )}

                    {submissionTypeKey === "partner_data" && (
                        <DataPasangan
                            data={dataPersonal}
                            setDataSubmit={setDataSubmit}
                            isLoadingSubmit={isLoadingSubmit}
                            isUpdate={isUpdate}
                            key={`partner-${isUpdate}-${JSON.stringify(dataPersonal || {})}`}
                        />
                    )}

                    {submissionTypeKey === "childrens_data" && (
                        <DataAnak
                            data={dataPersonal}
                            setDataSubmit={setDataSubmit}
                            isLoadingSubmit={isLoadingSubmit}
                            isUpdate={isUpdate}
                            key={`children-${isUpdate}-${JSON.stringify(dataPersonal || {})}`}
                        />
                    )}

                    {submissionTypeKey === "employee_files" && (
                        <BerkasKaryawan
                            data={dataPersonal}
                            isLoadingSubmit={isLoadingSubmit}
                            isUpdate={isUpdate}
                            key={`files-${isUpdate}-${JSON.stringify(dataPersonal || {})}`}
                        />
                    )}
                </div>
            </div>

            <ButtonFixBottom needBorderTop={false} hide={submissionTypeKey === "employee_files"}>
                {!isUpdate ? (
                    <CustomButton
                        bg={"var(--bg-primary-green)"}
                        color={"white"}
                        text={translate("change_information", language)}
                        handleClick={() => setIsUpdate(true)}
                        icon={<FaEdit size={20} color="white" />}
                    // disable
                    />
                ) : (
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: "20px" }}>
                        <CustomButton
                            color={"var(--bg-primary-green)"}
                            border={"1px solid var(--bg-primary-green)"}
                            text={translate("procurement_cancel", language)}
                            handleClick={handleCancel}
                            disable={isLoadingSubmit}
                        />
                        <CustomButton
                            bg={"var(--bg-primary-green)"}
                            color={"white"}
                            border={"1px solid var(--bg-primary-green)"}
                            text={isLoadingSubmit ? translate("loading", language) : translate("save", language)}
                            handleClick={handleSubmit}
                            disable={isLoadingSubmit}
                        />
                    </div>
                )}
            </ButtonFixBottom>

            <TypePopup
                top="10%"
                opened={typePopupOpened}
                onClose={closeTypePopup}
                options={submissionTypes}
                onSelect={(selectedLabel) => {
                    const idx = submissionTypes.findIndex((l) => l === selectedLabel);
                    const key = SUBMISSION_KEYS[Math.max(0, idx)];
                    setSubmissionTypeKey(key);
                    localStorage.setItem(LOCAL_KEY, key);
                    closeTypePopup();
                }}
            />
        </Page>
    );
}

export default DataPersonal;