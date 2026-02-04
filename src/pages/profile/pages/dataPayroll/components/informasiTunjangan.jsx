import React from 'react'
import { formatRupiah } from '../../../../../functions/formatRupiah'

const InformasiTunjangan = ({ data }) => {
    const isEmpty = (item) => {
        return item ? item : "-"
    }

    return (
        <div style={{ padding: "0 15px" }}>
            {(data.benefits && data.benefits.length > 0) && (
                data.benefits.map((item, index) => (
                    <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontWeight: 400, marginTop: "20px", fontSize: "var(--font-sm)" }}>
                        <p style={{ margin: "4px 0" }}>{isEmpty(item.display_name)}</p>
                        <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{item.benefit_value && typeof item.benefit_value === 'number' ? formatRupiah(item.benefit_value) : ""}</p>
                    </div>
                ))
            )}
        </div>
    )
}

export default InformasiTunjangan