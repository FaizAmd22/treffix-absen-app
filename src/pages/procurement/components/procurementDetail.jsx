import { Page } from 'framework7-react'
import React from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { formatRupiah } from '../../../functions/formatRupiah'
import { translate } from '../../../utils/translate'
import BackButton from '../../../components/backButton'
import { labelFilter } from '../../../functions/labelFilter'

const ProcurementDetail = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const datas = localStorage.getItem("detail_procurement")
    const data = JSON.parse(datas)

    const openLinkInBrowser = () => {
        window.open(data.url, "_blank");
    };

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "15px", marginBottom: "20px", fontSize: "var(--font-sm)", color: theme == "light" ? "black" : "white" }}>
                <BackButton label={translate('detail_procurement', language)} />

                <div style={{ display: "grid", gridTemplateColumns: "55% 45%", fontWeight: 400, marginTop: "10px" }}>
                    <p style={{ margin: "4px 0" }}>{translate('detail_procurement_item_name', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{data.title}</p>

                    <p style={{ margin: "4px 0" }}>{translate('detail_procurement_item_type', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", textTransform: "capitalize" }}>{labelFilter(data.type_of_procurement, language)}</p>

                    <p style={{ margin: "4px 0" }}>{translate('detail_procurement_item_price', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{formatRupiah(data.amount)}</p>

                    <p style={{ margin: "4px 0" }}>{translate('detail_procurement_item_link', language)}</p>
                    <p
                        onClick={openLinkInBrowser}
                        style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", overflow: "hidden", textDecoration: "underline", color: "var(--bg-primary-green)" }}
                    >
                        {data.url.length >= 27 ? data.url.slice(0, 15) + "..." : data.url}
                    </p>

                    <p style={{ margin: "4px 0" }}>{translate('detail_procurement_item_reason', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{data.reason}</p>

                    <p style={{ margin: "4px 0" }}>{translate('detail_procurement_item_status', language)}</p>
                    {
                        data.status == "approved" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: "var(--color-green)" }}>{translate('approved', language)}</p>
                            : data.status == "rejected" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: "var(--color-red)" }}>{translate('rejected', language)}</p>
                                : data.status == "idle" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: "var(--color-yellow)" }}>{translate('waiting_approval', language)}</p>
                                    : <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)" }}>{translate('canceled', language)}</p>
                    }
                </div>
            </div>
        </Page>
    )
}

export default ProcurementDetail