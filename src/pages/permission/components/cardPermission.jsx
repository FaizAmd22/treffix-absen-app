import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { PiDotsThreeOutlineVertical } from 'react-icons/pi';
import { Button, f7 } from 'framework7-react';
import { formatDate, formatDateCard } from '../../../functions/formatDate';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { getLeaveTypeName } from '../../../functions/getLeavetypeName';

const CardPermission = ({ openCancelPopup, data, leaveTypes }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    const handleOpenDetail = () => {
        localStorage.setItem("detail_permission", JSON.stringify(data))
        f7.views.main.router.navigate(`/permission-detail/${data.id}/`)
    }

    return (
        <div style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)", borderRadius: "12px", marginTop: "10px", boxShadow: "0 2px 16px 0 rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 15px" }}>
                <p style={{ fontSize: "var(--font-xs)", color: theme == "light" ? "var(--bg-secondary-gray)" : "var(--color-gray)", fontWeight: 500 }}>{formatDate(data.created_at, language)}</p>

                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 700 }}>
                    {
                        data.status == "approved" ? <p style={{ background: theme == "light" ? "var(--color-bg-green)" : "var(--color-bg-tr-green)", color: "var(--color-green)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('approved', language)}</p>
                            : data.status == "rejected" ? <p style={{ background: theme == "light" ? "var(--color-bg-red)" : "var(--color-bg-tr-red)", color: "var(--color-red)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('rejected', language)}</p>
                                : data.status == "idle" ? <p style={{ background: theme == "light" ? "var(--color-bg-yellow)" : "var(--color-bg-tr-yellow)", color: "var(--color-yellow)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('waiting_approval', language)}</p>
                                    : <p style={{ background: theme == "light" ? "var(--color-bg-gray)" : "var(--color-bg-tr-gray)", color: theme == "light" ? "var(--color-gray-light)" : "var(--color-gray-dark)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('canceled', language)}</p>
                    }

                    {
                        data.status == "idle" && (
                            <Button onClick={() => openCancelPopup(data.id)} style={{ width: "20px", padding: 0, margin: 0, marginRight: "-10px", marginLeft: "-8px", display: "flex", justifyContent: "center", alignItems: "center", background: "none", border: "none", color: theme == "light" ? "black" : "white" }}>
                                <PiDotsThreeOutlineVertical size={"20px"} />
                            </Button>
                        )
                    }
                </div>
            </div>

            <div style={{ background: theme == "light" ? "var(--border-primary-gray)" : "var(--bg-secondary-gray)", height: "1px", width: "100%" }} />

            <div onClick={handleOpenDetail} style={{ padding: "10px 15px" }}>
                {/*<p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "0", textTransform: "capitalize" }}>{data.type_of_leave == "cuti" ? translate('permission', language) : translate('leave', language)}</p>*/}
                <p style={{ fontSize: "var(--font-md)", fontWeight: "bold", marginBottom: "0", textTransform: "capitalize" }}>{getLeaveTypeName(data, leaveTypes)}</p>

                <p style={{ fontSize: "var(--font-sm)", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)" }}>
                    {/*{translate('date', language)} {data.type_of_leave == "cuti" ? translate('permission', language) : translate('leave', language)} : */}
                    {translate('date', language)} {(data.type_of_leave == "IS" || data.type_of_leave == "IPC" || data.type_of_leave == "WFH") ? translate('permission', language) : translate('leave', language)} :
                    <span style={{ fontWeight: "bold", color: theme == "light" ? "black" : "white" }}> {formatDateCard(data.start_date, language)} - {formatDateCard(data.end_date, language)}</span>
                </p>
            </div>
        </div>
    )
}

export default CardPermission