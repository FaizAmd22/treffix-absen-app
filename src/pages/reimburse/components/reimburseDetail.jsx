import React, { useState } from 'react'
import { Page } from 'framework7-react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { formatRupiah } from '../../../functions/formatRupiah';
import { formatDate } from '../../../functions/formatDate';
import FullImagePopup from '../../../components/fullImagePopup';
import BackButton from '../../../components/backButton';
import { translate } from '../../../utils/translate';

const ReimburseDetail = () => {
  const theme = useSelector(selectSettings)
  const language = useSelector(selectLanguages)
  const [fullImagePopupOpened, setFullImagePopupOpened] = useState(false);
  const [imagePopup, setImagePopup] = useState(null);
  const datas = localStorage.getItem("detail_reimburse")
  const data = JSON.parse(datas)

  console.log("data detail :", data);

  const handleOpenPopup = (image) => {
    setImagePopup(image);
    setFullImagePopupOpened(true);
  };

  return (
    <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
      <div style={{ padding: "15px", marginBottom: "20px", fontSize: "var(--font-sm)", color: theme == "light" ? "black" : "white" }}>
        <BackButton label={translate('detail_reimburse', language)} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontWeight: 400, marginTop: "10px" }}>
          <p style={{ margin: "4px 0" }}>{translate('detail_reimburse_name', language)}</p>
          <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{data.title}</p>

          <p style={{ margin: "4px 0" }}>{translate('detail_reimburse_type', language)}</p>
          <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{data.reimbursement_name}</p>

          <p style={{ margin: "4px 0" }}>{translate('detail_reimburse_amount', language)}</p>
          <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{formatRupiah(data.amount)}</p>

          <p style={{ margin: "4px 0" }}>{translate('detail_reimburse_reason', language)}</p>
          <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{data.reason}</p>

          <p style={{ margin: "4px 0" }}>{translate('detail_reimburse_date', language)}</p>
          <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{formatDate(data.created_at, language)}</p>

          <p style={{ margin: "4px 0" }}>{translate('detail_reimburse_status', language)}</p>
          {
            data.status == "approved" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: "var(--color-green)" }}>{translate('approved', language)}</p>
              : data.status == "rejected" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: "var(--color-red)" }}>{translate('rejected', language)}</p>
                : data.status == "idle" ? <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: "var(--color-yellow)" }}>{translate('waiting_approval', language)}</p>
                  : <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)" }}>{translate('canceled', language)}</p>
          }
        </div>

        {
          data.proof && (
            <>
              <p style={{ fontWeight: 700, margin: 0, marginTop: "20px" }}>{translate('detail_reimburse_proof', language)}</p>
              <div
                type="button"
                onClick={() => handleOpenPopup(data.proof)}
                style={{ width: "100%", height: "100%", borderRadius: "8px", padding: 0, border: "none" }}>
                <img src={data.proof} alt="uploaded" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }} />
              </div>
            </>
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

export default ReimburseDetail