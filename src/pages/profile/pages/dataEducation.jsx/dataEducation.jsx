import { Page, Button } from "framework7-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import BackButton from "../../../../components/backButton";
import ButtonFixBottom from "../../../../components/buttonFixBottom";
import CustomButton from "../../../../components/customButton";
import Loading from "../../../../components/loading";
import { FaEdit } from "react-icons/fa";
import { selectSettings } from "../../../../slices/settingsSlice";
import { selectLanguages } from "../../../../slices/languagesSlice";
import { translate } from "../../../../utils/translate";
import { API } from "../../../../api/axios";
import { showToast, showToastFailed } from "../../../../functions/toast";
import EducationForm from "./components/educationForm";

const DataEducation = () => {
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const [educationsData, setEducationsData] = useState([]);
    const [originalDataEducations, setOriginalDataEducations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

    const [dataSubmit, setDataSubmit] = useState({ educations: [] });

    const fetchEducation = async () => {
        setIsLoading(true);
        try {
            const response = await API.get("/mobile/employees/education");
            const data = response?.data?.payload || [];
            setEducationsData(data);
            setOriginalDataEducations(data);
        } catch (error) {
            console.error("Gagal fetch data pendidikan:", error);
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    }

    useEffect(() => {
        if (token) fetchEducation();
    }, [token]);

    const onRefresh = (done) => {
        fetchEducation();
        setTimeout(() => done(), 500);
    }

    const handleCancel = () => {
        setEducationsData(originalDataEducations);
        setIsUpdate(false);
    }

    const handleSubmit = async () => {
        setIsLoadingSubmit(true);
        try {
            await API.put("/mobile/employees/education", dataSubmit);
            showToast(translate("data_save_success", language), theme);
            await fetchEducation();
            setIsUpdate(false);
        } catch (error) {
            console.error("Gagal simpan:", error);
            showToastFailed(translate("data_save_failed", language));
        } finally {
            setIsLoadingSubmit(false);
        }
    }

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} ptr ptrMousewheel onPtrRefresh={onRefresh}>
            <div style={{ padding: "15px", marginBottom: "90px", fontSize: "var(--font-sm)", color: theme === "light" ? "black" : "white" }}>
                <BackButton label={translate("profile_education_data", language)} />

                {isLoading ? (
                    <Loading height="80vh" />
                ) : (
                    <EducationForm
                        data={educationsData}
                        setDataSubmit={setDataSubmit}
                        isUpdate={isUpdate}
                        isLoadingSubmit={isLoadingSubmit}
                    />
                )}
            </div>

            <ButtonFixBottom needBorderTop={false}>
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
                            text={
                                isLoadingSubmit
                                    ? translate("loading", language)
                                    : translate("save", language)
                            }
                            handleClick={handleSubmit}
                            disable={isLoadingSubmit}
                        />
                    </div>
                )}
            </ButtonFixBottom>
        </Page>
    );
}

export default DataEducation;
