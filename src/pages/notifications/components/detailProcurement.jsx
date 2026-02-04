import React from 'react'
import { useSelector } from 'react-redux'
import { selectLanguages } from '../../../slices/languagesSlice'
import { formatDate } from '../../../functions/formatDate'
import { translate } from '../../../utils/translate'
import { labelFilter } from '../../../functions/labelFilter'
import { formatRupiah } from '../../../functions/formatRupiah'

const DetailProcurement = ({ item, openLinkInBrowser }) => {
    const language = useSelector(selectLanguages)

    console.log("item :", item);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontWeight: 400, marginTop: "10px", marginBottom: "20px" }}>
            <p style={{ margin: "10px 0" }}>{translate('employees_who_apply', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", textTransform: "capitalize" }}>{item.name}</p>

            <p style={{ margin: "10px 0" }}>{translate('submission_date', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", textTransform: "capitalize" }}>{formatDate(item.created_at, language, "with-weekdays")}</p>

            <p style={{ margin: "10px 0" }}>{translate('detail_procurement_item_name', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{item.title}</p>

            <p style={{ margin: "10px 0" }}>{translate('detail_procurement_item_type', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", textTransform: "capitalize" }}>{labelFilter(item.type_of_procurement, language)}</p>

            <p style={{ margin: "10px 0" }}>{translate('detail_procurement_item_price', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{formatRupiah(item.amount)}</p>

            <p style={{ margin: "10px 0" }}>{translate('detail_procurement_item_link', language)}</p>
            <p
                onClick={openLinkInBrowser}
                style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", overflow: "hidden", textDecoration: "underline", color: "var(--bg-primary-green)" }}
            >
                {item.url.length >= 27 ? item.url.slice(0, 27) + "..." : item.url}
            </p>

            <p style={{ margin: "10px 0" }}>{translate('detail_procurement_item_reason', language)}</p>
            <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{item.reason}</p>

            <p style={{ margin: "10px 0" }}>{translate('detail_procurement_item_status', language)}</p>
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
        </div>
    )
}

export default DetailProcurement