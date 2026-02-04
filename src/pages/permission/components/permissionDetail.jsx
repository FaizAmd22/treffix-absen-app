import { Page } from 'framework7-react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { formatDate } from '../../../functions/formatDate'
import BackButton from '../../../components/backButton'
import FullImagePopup from '../../../components/fullImagePopup'
import { API } from '../../../api/axios'
import { translate } from '../../../utils/translate'

const PermissionDetail = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [fullImagePopupOpened, setFullImagePopupOpened] = useState(false);
    const [imagePopup, setImagePopup] = useState(null);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const token = localStorage.getItem("token")
    const datas = localStorage.getItem("detail_permission")
    const data = JSON.parse(datas)
    console.log("data detail permission :", data);

    const handleOpenPopup = (image) => {
        setImagePopup(image);
        setFullImagePopupOpened(true);
    };

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await API.get("/type-of-leave", {
                    params: {
                        page: 1,
                        sort_by: "created_at desc",
                        limit: 100,
                    },
                });

                console.log("permission category :", response.data.payload);
                setLeaveTypes(response.data.payload);
            } catch (error) {
                console.log("Data options tidak bisa diakses", error);
            }
        };

        if (token) {
            fetchOptions();
        }
    }, [token]);

    const getLabelFromLeaveTypes = (leaveTypes, typeOfLeave) => {
        const matchedLeaveType = leaveTypes.find(
            leaveType => leaveType.code.toUpperCase() === typeOfLeave.toUpperCase()
        );

        return matchedLeaveType ? matchedLeaveType.name : typeOfLeave;
    };

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "15px", marginBottom: "20px", fontSize: "var(--font-sm)", color: theme == "light" ? "black" : "white" }}>
                <BackButton label={translate('detail_permission', language)} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontWeight: 400, marginTop: "10px" }}>
                    <p style={{ margin: "4px 0" }}>{translate('detail_permission_type', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", textTransform: "capitalize" }}>{getLabelFromLeaveTypes(leaveTypes, data.type_of_leave)}</p>

                    <p style={{ margin: "4px 0" }}>{translate('start_date', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{formatDate(data.start_date, language)}</p>

                    <p style={{ margin: "4px 0" }}>{translate('end_date', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{formatDate(data.end_date, language)}</p>

                    <p style={{ margin: "4px 0" }}>{translate('reason_for_submission', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{data.reason}</p>

                    <p style={{ margin: "4px 0" }}>{translate('detail_permission_submission_status', language)}</p>
                    {
                        data.status == "approved" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: "var(--color-green)" }}>{translate('approved', language)}</p>
                            : data.status == "rejected" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: "var(--color-red)" }}>{translate('rejected', language)}</p>
                                : data.status == "idle" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: "var(--color-yellow)" }}>{translate('waiting_approval', language)}</p>
                                    : <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)" }}>{translate('canceled', language)}</p>
                    }

                    {
                        data.status == "approved" ? <p style={{ margin: "4px 0" }}>{translate('detail_permission_approved_by', language)}</p>
                            : data.status == "rejected" ? <p style={{ margin: "4px 0" }}>{translate('detail_permission_rejected_by', language)}</p>
                                : data.status == "canceled" ? <p style={{ margin: "4px 0" }}>{translate('detail_permission_canceled_by', language)}</p>
                                    : null
                    }
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{data.status_updated_by}</p>
                </div>

                <p style={{ fontWeight: 700, margin: 0, marginTop: "20px" }}>{translate('detail_permission_proof_of_submission', language)}</p>
                {
                    data.proof && (
                        <div
                            type="button"
                            onClick={() => handleOpenPopup(data.proof)}
                            style={{ width: "100%", height: "100%", borderRadius: "8px", padding: 0, border: "none" }}>
                            <img src={data.proof} alt="uploaded" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }} />
                        </div>
                    )
                }
            </div>

            <FullImagePopup
                opened={fullImagePopupOpened}
                onClose={() => setFullImagePopupOpened(false)}
                imageSrc={imagePopup}
            />
        </Page>
    )
}

export default PermissionDetail