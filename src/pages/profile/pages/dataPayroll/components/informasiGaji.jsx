import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../../../slices/settingsSlice';
import { formatRupiah } from '../../../../../functions/formatRupiah';
import { translate } from '../../../../../utils/translate';
import { selectLanguages } from '../../../../../slices/languagesSlice';
import Loading from '../../../../../components/loading';
import { API } from '../../../../../api/axios';
import InputDropdown from '../../../../../components/inputDropdown';
import InputText from '../../../../../components/inputText';

const InformasiGaji = ({ data, isLoading }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const token = localStorage.getItem("token")
    const [grades, setGrades] = useState([])
    const [isLoading2, setIsLoading2] = useState(false)

    const fetchGrade = async () => {
        setIsLoading2(true)
        try {
            const response = await API.get("/grade-level?page=1&sort_by=updated_at+desc&limit=100");
            const data = response.data.payload;
            setGrades(data)
        } catch (error) {
            console.log("Data request tidak bisa diakses", error);
        } finally {
            setTimeout(() => {
                setIsLoading2(false)
            }, 500);
        }
    };

    useEffect(() => {
        if (token) {
            fetchGrade()
        }
    }, [token])

    const filterGrade = (idGrade) => {
        if (idGrade && grades.length > 0) {
            const found = grades.find(item => item.id === idGrade);
            return found?.grade || "-";
        }
        return "-";
    }

    if (isLoading || isLoading2) {
        return <Loading height="60vh" />
    }

    return (
        <div style={{ marginTop: "20px", fontSize: "var(--font-sm)" }}>
            <InputText
                title={translate('factions', language)}
                value={data.employee_class_name}
                id={"employee_class_name"}
                disabled={true}
                theme={theme}
            />

            <InputText
                title={"Sub-Grade"}
                value={data.employee_class_id ? filterGrade(data.employee_class_id) : "-"}
                id={"employee_class_id"}
                disabled={true}
                theme={theme}
            />

            <InputText
                title={translate('basic_salary', language)}
                value={data.basic_salary ? formatRupiah(data.basic_salary) : "-"}
                id={"basic_salary"}
                disabled={true}
                theme={theme}
            />

            <InputText
                title={translate('salary_period', language)}
                value={data.salary_type}
                id={"salary_period"}
                disabled={true}
                theme={theme}
            />
        </div>
    )
}

export default InformasiGaji