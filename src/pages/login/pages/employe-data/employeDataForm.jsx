import { f7, Page } from "framework7-react";
import { useEffect, useRef, useState } from "react";
import BackButton from "../../../../components/backButton";
import Loading from "../../../../components/loading";
import { useSelector } from "react-redux";
import { selectLanguages } from "../../../../slices/languagesSlice";
import { API } from "../../../../api/axios";
import SocialMedia from "../../../profile/pages/dataPersonal/components/socialMedia";
import KontakDarurat from "../../../profile/pages/dataPersonal/components/kontakDarurat";
import DataPasangan from "../../../profile/pages/dataPersonal/components/dataPasangan";
import DataAnak from "../../../profile/pages/dataPersonal/components/dataAnak";
import InputDropdown from "../../../../components/inputDropdown";
import TypePopup from "../../../../components/typePopup";
import {
    hasChildOptions,
    maritalStatusOptions,
} from "../../../../utils/selectOptions";
import { findValueFromLabel } from "../../../../functions/findValueFromLabel";
import { findLabelFromValue } from "../../../../functions/findLabelFromValue";
import EducationForm from "../../../profile/pages/dataEducation.jsx/components/educationForm";
import DataBank from "../../../profile/pages/dataPayroll/components/dataBank";
import ButtonFixBottom from "../../../../components/buttonFixBottom";
import CustomButton from "../../../../components/customButton";
import CustomPopup from "../../../../components/customPopup";
import { translate } from "../../../../utils/translate";
import { showToastFailed } from "../../../../functions/toast";
import { selectSettings } from "../../../../slices/settingsSlice";
// import { selectUser } from "../../../../slices/userSlice";

const EmployeDataForm = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages);
    const [query, setQuery] = useState({});
    const [dataPersonal, setDataPersonal] = useState([]);
    const [dataEducation, setDataEducation] = useState([]);
    const [dataPayroll, setDataPayroll] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [dataSubmit, setDataSubmit] = useState([]);
    const [completedDatas, setCompletedDatas] = useState([]);
    const [confirmPopupOpened, setConfirmPopupOpened] = useState(false);
    const isOnboarding = localStorage.getItem("isOnboarding");

    const [popupOpened, setPopupOpened] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedMaritalStatus, setSelectedMaritalStatus] = useState(null);
    const [selectedHasChild, setSelectedHasChild] = useState(null);

    const [maritalStatusError, setMaritalStatusError] = useState("");
    const [hasChildError, setHasChildError] = useState("");

    const [partnerData, setPartnerData] = useState({});
    const [childrenData, setChildrenData] = useState({});

    const maritalStatusLabel = maritalStatusOptions.map((option) => option.label);
    const hasChildsLabel = hasChildOptions.map((option) => option.label);
    const isUpdate = false;
    // const userName = localStorage.getItem("userName");

    const selectedMaritalStatusLabel = findLabelFromValue(
        maritalStatusOptions,
        selectedMaritalStatus
    );
    const selectedHasChildLabel = findLabelFromValue(
        hasChildOptions,
        selectedHasChild
    );

    const validatorsRef = useRef({
        social: undefined,
        education: undefined,
        bank: undefined,
        emergency: undefined,
        partner: undefined,
        children: undefined,
    });

    const registerValidator = (key) => (fn) => {
        validatorsRef.current[key] = fn || undefined;
    };

    const selectMaritalStatus = (maritalLabel) => {
        const maritalValue = findValueFromLabel(maritalStatusOptions, maritalLabel);

        if (maritalValue !== selectedMaritalStatus) {
            setPartnerData({});
            setDataSubmit([]);
            validatorsRef.current.partner = undefined;
        }

        setSelectedMaritalStatus(maritalValue || null);
        setMaritalStatusError("");

        setPopupOpened(false);
    };

    const selectHasChild = (hasChildLabel) => {
        const hasChildValue = findValueFromLabel(hasChildOptions, hasChildLabel);

        if (hasChildValue !== selectedHasChild) {
            setChildrenData({});
            setDataSubmit([]);
            validatorsRef.current.children = undefined;
        }

        setSelectedHasChild(hasChildValue || null);
        setHasChildError("");
        setPopupOpened(false);
    };

    const fetchPersonal = async () => {
        setIsLoading(true);
        try {
            const response = await API.get("/mobile/employees/personal");
            const data = response.data.payload || {};

            setDataPersonal(data);
            setPartnerData(data);
            setChildrenData(data);

            if (data.marital_status) {
                setSelectedMaritalStatus(data.marital_status);
            }

            const defaultHasChild =
                Array.isArray(data?.childrens) && data.childrens.length > 0
                    ? "yes"
                    : null;
            setSelectedHasChild(defaultHasChild);
        } catch (error) {
            console.log("Data request tidak bisa diakses", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEducation = async () => {
        setIsLoading(true);
        try {
            const response = await API.get("/mobile/employees/education");
            const data = response?.data?.payload || [];
            setDataEducation(data);
        } catch (error) {
            console.error("Gagal fetch data pendidikan:", error);
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    const fetchPayroll = async () => {
        setIsLoading(true);
        try {
            const response = await API.get("/mobile/employees/payroll");
            const data = response.data.payload;
            setDataPayroll(data);
        } catch (error) {
            console.log("Data request tidak bisa diakses", error);
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    const fetchData = async () => {
        const getSteps = await API.get("/mobile/employees/onboarding/steps");
        setCompletedDatas(getSteps.data.payload.completed_data);
    };

    useEffect(() => {
        setIsLoading(true);
        fetchData();
        fetchPersonal();
        fetchEducation();
        fetchPayroll();
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        const params = f7.views.main.router.currentRoute.query;
        setQuery(params || {});
        localStorage.setItem("isOnboarding", "true");
    }, []);

    const handleVerifyClick = () => {
        let ok = true;
        setMaritalStatusError("");
        setHasChildError("");

        if (query.value === "partner_data") {
            if (!selectedMaritalStatus) {
                setMaritalStatusError("Status kawin harus dipilih");
                ok = false;
            }
            if (
                selectedMaritalStatus === "married" &&
                validatorsRef.current.partner
            ) {
                ok = validatorsRef.current.partner() && ok;
            }
        } else if (query.value === "childrens_data") {
            if (!selectedHasChild) {
                setHasChildError("Mohon pilih apakah sudah memiliki anak");
                ok = false;
            }
            if (selectedHasChild === "yes" && validatorsRef.current.children) {
                ok = validatorsRef.current.children() && ok;
            }
        } else if (query.value === "social_media") {
            if (validatorsRef.current.social)
                ok = validatorsRef.current.social() && ok;
        } else if (query.value === "education_data") {
            if (validatorsRef.current.education)
                ok = validatorsRef.current.education() && ok;
        } else if (query.value === "bank_data") {
            if (validatorsRef.current.bank) ok = validatorsRef.current.bank() && ok;
        } else if (query.value === "emergency_contact") {
            if (validatorsRef.current.emergency)
                ok = validatorsRef.current.emergency() && ok;
        }

        if (!ok) return;
        setConfirmPopupOpened(true);
    };

    const handleSubmitPopup = async () => {
        setIsLoadingSubmit(true);
        let url = "";

        if (query.value === "social_media") {
            url = "/mobile/employees/personal/social-media";
        } else if (query.value === "emergency_contact") {
            url = "/mobile/employees/personal/emergency-contact";
        } else if (query.value === "partner_data") {
            url = "/mobile/employees/personal/spouse";
        } else if (query.value === "childrens_data") {
            url = "/mobile/employees/personal/children";
        } else if (query.value === "education_data") {
            url = "/mobile/employees/education";
        } else if (query.value === "bank_data") {
            url = "/mobile/employees/bank";
        } else {
            setIsLoadingSubmit(false);
            return;
        }

        try {
            let payload = dataSubmit;

            if (query.value === "childrens_data" && selectedHasChild === "no") {
                payload = { childrens: [] };
            }

            if (query.value === "partner_data") {
                if (selectedMaritalStatus !== "married") {
                    payload = {
                        spouse_name: null,
                        spouse_gender: null,
                        spouse_birth_date: null,
                        marital_status: selectedMaritalStatus,
                    };
                } else {
                    payload = {
                        spouse_name: dataSubmit?.spouse_name ?? null,
                        spouse_gender: dataSubmit?.spouse_gender ?? null,
                        spouse_birth_date: dataSubmit?.spouse_birth_date ?? null,
                        marital_status: selectedMaritalStatus,
                    };
                }
            }

            if (url) {
                await API.put(url, payload);
            }

            // if (query.value === "partner_data") {
            //     const profilePayload = {
            //         identity_number: dataPersonal.identity_number,
            //         birth_place: dataPersonal.birth_place,
            //         name: dataUser.name,
            //         date_of_birth: dataPersonal.date_of_birth,
            //         marital_status: selectedMaritalStatus,
            //         blood_type: dataPersonal.blood_type,
            //         religion: dataPersonal.religion,
            //         address: dataPersonal.address,
            //         domicile_address:
            //             dataPersonal.domicile_address !== undefined
            //                 ? dataPersonal.domicile_address
            //                 : null,
            //         family_card_number:
            //             dataPersonal.family_card_number !== undefined
            //                 ? dataPersonal.family_card_number
            //                 : null,
            //     };

            //     console.log("profile Payload :", profilePayload);

            //     const profileRes = await API.put(
            //         "/mobile/employees/personal/profile",
            //         profilePayload
            //     );
            //     console.log("Update profile success:", profileRes.data);
            // }

            if (!completedDatas.includes(query.value)) {
                await API.put("/mobile/employees/onboarding/employee-data", {
                    step: query.value,
                });
            }

            setIsLoadingSubmit(false);
            setConfirmPopupOpened(false);
            f7.views.main.router.back();
        } catch (error) {
            console.error("Submit failed:", error);
            setIsLoadingSubmit(false);
            setConfirmPopupOpened(false);
            showToastFailed(translate("data_save_failed", language));
        }
    };

    if (isLoading) {
        return (
            <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
                <div style={{ padding: "15px", marginBottom: "90px", color: theme === "light" ? "black" : "white" }}>
                    <BackButton label={query.label} />
                    <Loading height={"80vh"} />
                </div>
            </Page>
        );
    }

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "15px", marginBottom: "90px", color: theme === "light" ? "black" : "white" }}>
                <BackButton label={query.label} />

                {query.value === "social_media" && (
                    <SocialMedia
                        data={dataPersonal?.social_medias}
                        setDataSubmit={setDataSubmit}
                        isLoadingSubmit={isLoadingSubmit}
                        isUpdate={true}
                        isOnboarding={isOnboarding}
                        onRegisterValidator={registerValidator("social")}
                        key={`social-${isUpdate}-${JSON.stringify(
                            dataPersonal?.social_medias || []
                        )}`}
                    />
                )}

                {query.value === "education_data" && (
                    <EducationForm
                        data={dataEducation}
                        setDataSubmit={setDataSubmit}
                        isUpdate={true}
                        isLoadingSubmit={isLoadingSubmit}
                        onRegisterValidator={registerValidator("education")}
                        key={`education-${isUpdate}-${JSON.stringify(dataEducation || [])}`}
                    />
                )}

                {query.value === "bank_data" && (
                    <DataBank
                        data={dataPayroll}
                        setDataSubmit={setDataSubmit}
                        isUpdate={true}
                        isLoadingSubmit={isLoadingSubmit}
                        isOnboarding={isOnboarding}
                        onRegisterValidator={registerValidator("bank")}
                        key={`bank-${isUpdate}-${JSON.stringify(dataPayroll || [])}`}
                    />
                )}

                {query.value === "emergency_contact" && (
                    <KontakDarurat
                        data={dataPersonal}
                        setDataSubmit={setDataSubmit}
                        isLoadingSubmit={isLoadingSubmit}
                        isUpdate={true}
                        onRegisterValidator={registerValidator("emergency")}
                        key={`emergency-${isUpdate}-${JSON.stringify(dataPersonal || {})}`}
                    />
                )}

                {query.value === "partner_data" && (
                    <div style={{ marginTop: "15px" }}>
                        <InputDropdown
                            title={"Status Kawin"}
                            value={selectedMaritalStatusLabel ?? null}
                            noValue={"Pilih Status Kawin"}
                            onClick={() => {
                                setSelectedOption("maritalStatus");
                                setPopupOpened(true);
                            }}
                            error={!!maritalStatusError}
                            errorMessage={maritalStatusError}
                            theme={"light"}
                        />

                        <DataPasangan
                            data={partnerData}
                            setDataSubmit={setDataSubmit}
                            isLoadingSubmit={isLoadingSubmit}
                            isUpdate={selectedMaritalStatus === "married"}
                            isOnboarding={isOnboarding}
                            onRegisterValidator={registerValidator("partner")}
                            key={`partner-${selectedMaritalStatus || "none"}-${JSON.stringify(
                                partnerData || {}
                            )}`}
                        />
                    </div>
                )}

                {query.value === "childrens_data" && (
                    <div style={{ marginTop: "15px" }}>
                        <InputDropdown
                            title={"Sudah Memiliki Anak?"}
                            value={selectedHasChildLabel ?? null}
                            noValue={"Apakah Anda Memiliki Anak?"}
                            onClick={() => {
                                setSelectedOption("hasChild");
                                setPopupOpened(true);
                            }}
                            error={!!hasChildError}
                            errorMessage={hasChildError}
                            theme={"light"}
                        />

                        <DataAnak
                            data={childrenData}
                            setDataSubmit={setDataSubmit}
                            isLoadingSubmit={isLoadingSubmit}
                            isUpdate={selectedHasChild === "yes"}
                            isOnboarding={isOnboarding}
                            onRegisterValidator={registerValidator("children")}
                            key={`children-${selectedHasChild || "none"}-${JSON.stringify(
                                childrenData || {}
                            )}`}
                        />
                    </div>
                )}
            </div>

            <ButtonFixBottom needBorderTop={false}>
                <CustomButton
                    bg={"var(--bg-primary-green)"}
                    color={"white"}
                    text={"Verifikasi Data"}
                    handleClick={handleVerifyClick}
                />
            </ButtonFixBottom>

            <TypePopup
                top={"82%"}
                height="75vh"
                opened={popupOpened}
                onClose={() => setPopupOpened(false)}
                options={
                    selectedOption === "maritalStatus"
                        ? maritalStatusLabel
                        : hasChildsLabel
                }
                onSelect={
                    selectedOption === "maritalStatus"
                        ? selectMaritalStatus
                        : selectHasChild
                }
            />

            <CustomPopup
                popupOpened={confirmPopupOpened}
                setPopupOpened={setConfirmPopupOpened}
                title={`Verifikasi ${query?.label}`}
                message={`Pastikan semua data ${query?.label} yang Anda isi sudah benar. Isi data selanjutnya?`}
                btnNo={translate("procurement_cancel", language)}
                handleCancel={() => setConfirmPopupOpened(false)}
                btnYes={translate("done", language)}
                handleConfirm={handleSubmitPopup}
                top={250}
            />
        </Page>
    );
};

export default EmployeDataForm;
