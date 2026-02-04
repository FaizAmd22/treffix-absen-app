import React from 'react'
import { useSelector } from 'react-redux'
import { selectLanguages } from '../../../slices/languagesSlice'
import { formatDate } from '../../../functions/formatDate'
import { translate } from '../../../utils/translate'
import { labelFilter } from '../../../functions/labelFilter'
import { formatRupiah } from '../../../functions/formatRupiah'

const DetailReimbursement = ({ item, handleOpenPopup }) => {
    const language = useSelector(selectLanguages)

    console.log("item :", item);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontWeight: 400, marginTop: "10px", marginBottom: "20px" }}>
            <p style={{ margin: "10px 0" }}>{translate('employees_who_apply', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", textTransform: "capitalize" }}>{item.name}</p>

            <p style={{ margin: "10px 0" }}>{translate('submission_date', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", textTransform: "capitalize" }}>{formatDate(item.created_at, language, "with-weekdays")}</p>

            <p style={{ margin: "10px 0" }}>{translate('type_of_submission', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", textTransform: "capitalize" }}>{item.type}</p>

            <p style={{ margin: "10px 0" }}>{translate('detail_reimburse_name', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{item.reimbursement_name}</p>

            <p style={{ margin: "10px 0" }}>{translate('detail_reimburse_amount', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{formatRupiah(item.amount)}</p>

            <p style={{ margin: "10px 0" }}>{translate('reason_for_submission', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{item.reason}</p>

            <p style={{ margin: "10px 0" }}>{translate('detail_permission_submission_status', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>
                {
                    item.status == "approved" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", color: "var(--color-green)" }}>{translate('approved', language)}</p>
                        : item.status == "rejected" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", color: "var(--color-red)" }}>{translate('rejected', language)}</p>
                            : item.status == "idle" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", color: "var(--color-yellow)" }}>{`${translate('waiting_approval', language)} ${item.approval.waiting_for_user}`}</p>
                                : <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", color: "var(--color-gray)" }}>{translate('canceled', language)}</p>
                }
            </p>

            {item.status_note && (
                <>
                    <p style={{ margin: "10px 0" }}>{translate('reason_for_submission', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{item.status_note}</p>
                </>
            )}

            <p style={{ margin: 0, marginTop: "20px", gridColumn: "1 / -1" }}>{translate('submission_permission_supporting_documents', language)}</p>
            {
                item.proof && (
                    <div
                        type="button"
                        onClick={() => handleOpenPopup(item.proof)}
                        style={{ width: "100%", height: "100%", borderRadius: "8px", padding: 0, border: "none", gridColumn: "1 / -1" }}>
                        <img src={item.proof} alt="uploaded" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }} />
                    </div>
                )
            }
        </div>
    )
}

export default DetailReimbursement