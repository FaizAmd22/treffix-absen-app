import { Page } from 'framework7-react';
import React, { useEffect, useState } from 'react';
import BackButton from '../../../../components/backButton';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../../slices/settingsSlice';
import { translate } from '../../../../utils/translate';
import { selectLanguages } from '../../../../slices/languagesSlice';
import { API } from '../../../../api/axios';
import Loading from '../../../../components/loading';
import { selectUser } from '../../../../slices/userSlice';
import InputText from '../../../../components/inputText';

const DataUser = () => {
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages)
    const token = localStorage.getItem("token")
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false)
    const user = useSelector(selectUser)

    const fetchUserData = async () => {
        setIsLoading(true)
        try {
            const response = await API.get("/mobile/employees/user");
            const data = response.data.payload;

            console.log("data :", data);
            setFormData(data)
        } catch (error) {
            console.log("Data request tidak bisa diakses", error);
        } finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserData()
        }
    }, [token])

    const onRefresh = (done) => {
        fetchUserData()
        setTimeout(() => {
            done();
        }, 500);
    }

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <div style={{ padding: "15px", color: theme === "light" ? "black" : "white", fontSize: "var(--font-sm)" }}>
                <BackButton label={translate('profile_user_data', language)} />

                {isLoading ? (
                    <Loading height="80vh" />
                ) : (
                    <form style={{ fontSize: "var(--font-sm)" }}>
                        <InputText
                            title={translate('fullname', language)}
                            value={formData.name}
                            id={"fullname"}
                            disabled={true}
                            theme={theme}
                        />

                        <InputText
                            title={translate('personal_email', language)}
                            value={formData.private_email ? formData.private_email : user.email}
                            id={"personal_email"}
                            disabled={true}
                            theme={theme}
                        />

                        <InputText
                            title={translate('whastapp_number', language)}
                            value={formData.whatsapp}
                            id={"whastapp_number"}
                            disabled={true}
                            theme={theme}
                        />

                        <InputText
                            title={"Origin Company"}
                            value={formData.company_name}
                            id={"Origin Company"}
                            disabled={true}
                            theme={theme}
                        />

                        <InputText
                            title={"Assign To Company"}
                            value={formData.assigned_company_name}
                            id={"Assign To Company"}
                            disabled={true}
                            theme={theme}
                        />

                        <InputText
                            title={"Role"}
                            value={formData.role_name}
                            id={"Role"}
                            disabled={true}
                            theme={theme}
                        />

                        <InputText
                            title={"Working Area"}
                            value={formData.areas?.map(area => area.name).join(', ')}
                            id={"Working Area"}
                            disabled={true}
                            theme={theme}
                        />

                        <InputText
                            title={translate('account_status', language)}
                            value={formData.status}
                            id={"account_status"}
                            disabled={true}
                            theme={theme}
                        />
                    </form>
                )}
            </div>
        </Page>
    );
};

export default DataUser;
