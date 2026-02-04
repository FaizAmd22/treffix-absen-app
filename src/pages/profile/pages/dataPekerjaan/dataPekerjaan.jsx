import { Page } from 'framework7-react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../../slices/settingsSlice'
import BackButton from '../../../../components/backButton'
import TypePopup from '../../../../components/typePopup'
import { MdNavigateNext } from 'react-icons/md'
import EmploymentComponent from './components/employmentComponent'
import EmploymentStatus from './components/employmentStatus'
import EmploymentStructure from './components/employmentStructure'
import { selectLanguages } from '../../../../slices/languagesSlice'
import { translate } from '../../../../utils/translate'
import { API } from '../../../../api/axios'

const DataPekerjaan = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [submissionType, setSubmissionType] = useState(translate('profile_employment_data', language));
    const [typePopupOpened, setTypePopupOpened] = useState(false);
    const [dataEmployee, setDataEmployee] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const token = localStorage.getItem("token")

    console.log("datas :", dataEmployee);

    const submissionTypes = [
        translate('profile_employment_data', language),
        translate('structure_level', language),
        translate('employment_status', language)
    ];

    const fetchEmployee = async () => {
        setIsLoading(true)
        try {
            const response = await API.get("/mobile/employees/employment");
            const data = response.data.payload;

            console.log("data :", data);
            setDataEmployee(data)
        } catch (error) {
            console.log("Data request tidak bisa diakses", error);
        } finally {
            setTimeout(() => {
                setIsLoading(false)
            }, 500);
        }
    };

    useEffect(() => {
        if (token) {
            fetchEmployee()
        }
    }, [token])

    const onRefresh = (done) => {
        fetchEmployee()
        setTimeout(() => {
            done();
        }, 500);
    }

    const openTypePopup = () => setTypePopupOpened(true);
    const closeTypePopup = () => setTypePopupOpened(false);
    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <div style={{ padding: "15px", marginBottom: "15px", fontSize: "var(--font-sm)", color: theme === "light" ? "black" : "white" }}>
                <BackButton label={translate('profile_employment_data', language)} />

                <div>
                    <div
                        onClick={openTypePopup}
                        style={{
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: theme === "light" ? "1px solid #ccc" : "1px solid #363636",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}
                    >
                        {submissionType}
                        <MdNavigateNext size={"18px"} color="var(--bg-primary-green)" />
                    </div>

                    {submissionType == translate('profile_employment_data', language) && (
                        <EmploymentComponent data={dataEmployee} isLoading={isLoading} />
                    )}

                    {submissionType == translate('structure_level', language) && (
                        <EmploymentStructure isLoading={isLoading} />
                    )}

                    {submissionType == translate('employment_status', language) && (
                        <EmploymentStatus language={language} data={dataEmployee} />
                    )}
                </div>
            </div>

            <TypePopup
                top="70%"
                opened={typePopupOpened}
                onClose={closeTypePopup}
                options={submissionTypes}
                onSelect={(selectedType) => {
                    setSubmissionType(selectedType);
                    closeTypePopup();
                }}
            />
        </Page>
    )
}

export default DataPekerjaan