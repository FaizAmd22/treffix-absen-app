import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { PiDotsThreeOutlineVertical } from 'react-icons/pi';
import { formatDate } from '../../../functions/formatDate';
import { selectLanguages } from '../../../slices/languagesSlice';
import { formatRupiah } from '../../../functions/formatRupiah';
import { Button, f7 } from 'framework7-react';
import { translate } from '../../../utils/translate';

const CardReimburse = ({ data, openCancelPopup, filterGradeId }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    const handleOpenDetail = () => {
        localStorage.setItem("detail_reimburse", JSON.stringify(data))
        f7.views.main.router.navigate(`/reimburse-detail/${data.id}/`)
    }

    return (
        <div style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)", color: theme == "light" ? "black" : "white", borderRadius: "12px", marginTop: "10px", boxShadow: "0px 2px 16px 0px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 15px" }}>
                <p style={{ fontSize: "var(--font-xs)", color: theme == "light" ? "var(--bg-secondary-gray)" : "var(--color-gray)" }}>{formatDate(data.created_at, language)}</p>

                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 700 }}>
                    {
                        data.status == "approved" ? <p style={{ background: theme == "light" ? "var(--color-bg-green)" : "var(--color-bg-tr-green)", color: "var(--color-green)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('approved', language)}</p>
                            : data.status == "rejected" ? <p style={{ background: theme == "light" ? "var(--color-bg-red)" : "var(--color-bg-tr-red)", color: "var(--color-red)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('rejected', language)}</p>
                                : data.status == "idle" ? <p style={{ background: theme == "light" ? "var(--color-bg-yellow)" : "var(--color-bg-tr-yellow)", color: "var(--color-yellow)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('waiting_approval', language)}</p>
                                    : <p style={{ background: theme == "light" ? "var(--color-bg-gray)" : "var(--color-bg-tr-gray)", color: theme == "light" ? "var(--color-gray-light)" : "var(--color-gray-dark)", borderRadius: "20px", fontSize: "var(--font-xxs)", padding: "5px 20px" }}>{translate('canceled', language)}</p>
                    }

                    {
                        data.status == "idle" && (
                            <Button onClick={() => openCancelPopup(data.id, data.title)} style={{ width: "20px", padding: 0, margin: 0, marginLeft: "-8px", marginRight: "-10px", display: "flex", justifyContent: "center", alignItems: "center", background: "none", border: "none", color: theme == "light" ? "black" : "white" }}>
                                <PiDotsThreeOutlineVertical size={"20px"} />
                            </Button>
                        )
                    }
                </div>
            </div>

            <div style={{ background: theme == "light" ? "var(--border-primary-gray)" : "var(--bg-secondary-gray)", height: "1px", width: "100%" }} />

            <div onClick={handleOpenDetail} style={{ padding: "10px 15px" }}>
                <p style={{ fontSize: "var(--font-md)", fontWeight: "bold", marginBottom: "0" }}>{data.title}</p>

                <div style={{ fontSize: "var(--font-sm)", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p>{data.reimbursement_name}</p>

                    <p>
                        {translate('reimburse_amount', language)}
                        <span style={{ fontWeight: "bold", color: theme == "light" ? "black" : "white" }}> {formatRupiah(data.amount)}</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CardReimburse