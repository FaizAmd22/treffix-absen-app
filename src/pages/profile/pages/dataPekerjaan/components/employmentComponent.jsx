import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../../../slices/settingsSlice'
import { translate } from '../../../../../utils/translate'
import { selectLanguages } from '../../../../../slices/languagesSlice'
import { API } from '../../../../../api/axios'
import Loading from '../../../../../components/loading'
import InputText from '../../../../../components/inputText'
import InputTextarea from '../../../../../components/inputTextarea'

const EmploymentComponent = ({ data, isLoading }) => {
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

            console.log("data grade :", data);
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
        <div>
            <form style={{ fontSize: "var(--font-sm)", marginTop: "20px" }}>
                <InputText
                    title={translate('employee_identification_number', language)}
                    value={data.employee_id}
                    id={"employee_id"}
                    disabled={true}
                    theme={theme}
                />

                <InputText
                    title={translate('job_position', language)}
                    value={data.job_position_name}
                    id={"job_position_name"}
                    disabled={true}
                    theme={theme}
                />

                <InputTextarea
                    title={translate('job_description', language)}
                    id={"job_description"}
                    type={"noLabel"}
                    noMargin={false}
                    placeholder={translate('job_description', language)}
                    value={data.job_description}
                    onChange={() => { }}
                    disabled={true}
                    theme={theme}
                />

                <InputTextarea
                    title={translate('qualification', language)}
                    id={"qualification"}
                    type={"noLabel"}
                    noMargin={false}
                    placeholder={translate('job_requirement', language)}
                    value={data.job_requirement}
                    onChange={() => { }}
                    disabled={true}
                    theme={theme}
                />

                <InputText
                    title={translate('other_job_positions', language)}
                    value={
                        Array.isArray(data.other_job_positions) && data.other_job_positions.length > 0
                            ? data.other_job_positions.map((job) => job.name).join(", ")
                            : "-"
                    }
                    id={"other_job_positions"}
                    disabled={true}
                    theme={theme}
                />

                <InputText
                    title={"Grade"}
                    value={data.grade_level_id ? filterGrade(data.grade_level_id) : "-"}
                    id={"job_requirement"}
                    disabled={true}
                    theme={theme}
                />
            </form>
        </div>
    )
}

export default EmploymentComponent