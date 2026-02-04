import React from 'react'
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../../../slices/settingsSlice';
import { formatDate } from '../../../../../functions/formatDate';
import { translate } from '../../../../../utils/translate';
import InputDropdown from '../../../../../components/inputDropdown';
import InputText from '../../../../../components/inputText';

const EmploymentStatus = ({ language, data }) => {
    const theme = useSelector(selectSettings)

    return (
        <div>
            <form style={{ fontSize: "var(--font-sm)", marginTop: "20px" }}>
                <InputText
                    title={translate('contract_status', language)}
                    value={data.contract_status}
                    id={"contract_status"}
                    disabled={true}
                    theme={theme}
                />

                <InputText
                    title={translate('entry_date', language)}
                    value={data.start_date ? formatDate(data.start_date, language) : "-"}
                    id={"entry_date"}
                    disabled={true}
                    theme={theme}
                />

                <InputText
                    title={translate('date_completed', language)}
                    value={data.end_date ? formatDate(data.end_date, language) : "-"}
                    id={"date_completed"}
                    disabled={true}
                    theme={theme}
                />

                <InputText
                    title={translate('actual_entry_date', language)}
                    value={data.actual_start_end ? formatDate(data.actual_start_end, language) : "-"}
                    id={"actual_entry_date"}
                    disabled={true}
                    theme={theme}
                />

                <InputText
                    title={translate('bpjs_ketenagakerjaan', language)}
                    value={data.bpjs_work_number}
                    id={"bpjs_ketenagakerjaan"}
                    disabled={true}
                    theme={theme}
                />

                <InputText
                    title={translate('bpjs_kesehatan', language)}
                    value={data.bpjs_health_number}
                    id={"bpjs_kesehatan"}
                    disabled={true}
                    theme={theme}
                />

                <InputText
                    title={"NPWP"}
                    value={data.tax_number}
                    id={"tax_number"}
                    disabled={true}
                    theme={theme}
                />

                <InputText
                    title={translate('tax_status', language)}
                    value={data.tax_status}
                    id={"tax_status"}
                    disabled={true}
                    theme={theme}
                />

                <InputText
                    title={translate('medical_insurance', language)}
                    value={data.medical_insurance}
                    id={"medical_insurance"}
                    disabled={true}
                    theme={theme}
                />
            </form>
        </div>
    )
}

export default EmploymentStatus