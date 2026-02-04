import { Button, f7, Page } from 'framework7-react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import VisitImage2 from "../../../assets/user-pic.jpeg"
import FullImagePopup from '../../../components/fullImagePopup'
import BackButton from '../../../components/backButton'
import { formatDate } from '../../../functions/formatDate'
import { selectLanguages } from '../../../slices/languagesSlice'
import { translate } from '../../../utils/translate'
import { getHoursMinutes } from '../../../functions/getHoursMinutes'
import ConfirmPopup from '../../notifications/components/confirmPopup'
import RejectedPopup from '../../notifications/components/rejectPopup'
import { API } from '../../../api/axios'
import { showToast, showToastFailed } from '../../../functions/toast'
import LoadingPopup from '../../../components/loadingPopup'
import MessageAlert from '../../../components/messageAlert'
import ImageAlertLight from '../../../assets/messageAlert/absen-light.png'
import ImageAlertDark from '../../../assets/messageAlert/absen-dark.png'
import ImageAlertLight2 from '../../../assets/messageAlert/cancel-light.png'
import ImageAlertDark2 from '../../../assets/messageAlert/cancel-dark.png'

const OvertimeDetails = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [userLocation, setUserLocation] = useState({ lat: -6.2661715, lng: 106.6307022 });
    const [fullImagePopupOpened, setFullImagePopupOpened] = useState(false);
    const [imagePopup, setImagePopup] = useState(null);
    const [reasonReject, setReasonReject] = useState(null);
    const [isApprovePopup, setIsApprovePopup] = useState(false);
    const [isRejectPopup, setIsRejectPopup] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [isTriggered, setIsTriggered] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [sheetOpened, setSheetOpened] = useState(false);
    const [dataDetail, setdataDetail] = useState([]);

    useEffect(() => {
        localStorage.setItem("location_lat", userLocation.lat)
        localStorage.setItem("location_lng", userLocation.lng)

        fetchDetailOvertime()
    }, [])

    // const handleOpenPopup = (image) => {
    //     setImagePopup(image);
    //     setFullImagePopupOpened(true);
    // };

    const fetchDetailOvertime = async () => {
        const id = f7.views.main.router.currentRoute.params.id

        console.log("id detail :", id);

        try {
            const response = await API.get(`/form-request-overtime/${id}`)

            console.log("detail overtime :", response.data);
            setdataDetail(response.data.payload)
        } catch (error) {
            // f7.dialog.alert('Data detail tidak bisa didapatkan!', () => f7.views.main.router.back())
            showToastFailed(translate('training_detail_failed_getdetail', language))
        }
    }

    const handleConfirm = async (selectedId, types) => {
        setIsRejectPopup(false)
        setIsApprovePopup(false)
        setShowLoading(true)
        setSelectedType(types)
        const url = types === "approve"
            ? `/form-request-approve/${selectedId}`
            : `/form-request-reject/${selectedId}`;

        const rejctedPayload = { status_note: reasonReject }
        const payload = types == "reject" ? rejctedPayload : null
        const messageAlert = types == "reject" ? "Pengajuan ditolak, karyawan yang bersangkutan akan menerima notifikasi bahwa pengajuannya telah ditolak." : "Pengajuan berhasil disetujui, karyawan akan menerima notifikasi bahwa pengajuan mereka diterima."

        try {
            const response = await API.put(url, payload);

            console.log("response handleConfirm :", response.data);

            setShowLoading(false)
            // f7.dialog.alert(messageAlert, () => f7.views.main.router.refreshPage());
            f7.views.main.router.refreshPage()
            // showToast(messageAlert, theme)
            setSheetOpened(true)
        } catch (error) {
            console.error(`Gagal ${types} request:`, error);
            setShowLoading(false)
            // f7.dialog.alert("Terjadi kesalahan saat memproses request.", () => f7.views.main.router.refreshPage());
            showToastFailed(translate('request_failed', language))
        }

        setIsApprovePopup(false);
        setIsRejectPopup(false);
        f7.views.main.router.refreshPage()
    };

    // useEffect(() => {
    //     if (showLoading) {
    //         f7.dialog.preloader('Loading...');
    //     } else {
    //         f7.dialog.close();
    //     }
    // }, [showLoading]);

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "15px", marginBottom: "10px", fontSize: "var(--font-sm)", color: theme == "light" ? "black" : "white" }}>
                <BackButton label={translate('overtime_details', language)} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontWeight: 400 }}>
                    <p style={{ margin: "10px 0" }}>{translate('detail_reimburse_date', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{formatDate(dataDetail.created_at, language, "with-weekdays")}</p>

                    <p style={{ margin: "10px 0" }}>{translate('overtime_date', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{formatDate(dataDetail.start_date, language, "with-weekdays")}</p>

                    <p style={{ margin: "10px 0" }}>{translate('overtime_reason', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{dataDetail.type_of_overtime}</p>

                    <p style={{ margin: "10px 0" }}>{translate('start_hour', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{getHoursMinutes(dataDetail.start_overtime)}</p>

                    <p style={{ margin: "10px 0" }}>{translate('end_hour', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{getHoursMinutes(dataDetail.end_overtime)}</p>

                    <p style={{ margin: "10px 0" }}>{translate('overtime_details', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{dataDetail.reason_category}</p>

                    <p style={{ margin: "10px 0" }}>{translate('overtime_desc_reason', language)}</p>
                    <p style={{ fontWeight: 700, textAlign: "end", margin: "10px 0" }}>{dataDetail.reason}</p>

                    {/*<p style={{ margin: "10px 0" }}>{translate('overtime_location', language)}</p>
                    <p onClick={() => f7.views.main.router.navigate('/visit-map/')} style={{ fontWeight: 700, textAlign: "end", margin: "10px 0", color: "var(--bg-primary-green)" }}>{translate('visit_view_pin_point_address', language)}</p>*/}
                </div>

                {/*<p style={{ fontWeight: 700, margin: 0, marginTop: "20px" }}>{translate('overtime_face_verification', language)}</p>
                <div
                    type="button"
                    onClick={() => handleOpenPopup(VisitImage2)}
                    style={{ width: "100%", height: "100%", borderRadius: "8px", padding: 0, border: "none" }}>
                    <img src={VisitImage2} alt="uploaded" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }} />
                </div>*/}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontWeight: 400 }}>
                    <p style={{ margin: "10px 0" }}>{translate('notification_settings_submission', language)}</p>
                    {
                        dataDetail.status == "approved" ? <p style={{ fontWeight: 700, textAlign: "end", color: "var(--color-green)", margin: "10px 0" }}>{translate('approve', language)}</p>
                            : dataDetail.status == "rejected" ? <p style={{ fontWeight: 700, textAlign: "end", color: "var(--color-red)", margin: "10px 0" }}>{translate('rejected', language)}</p>
                                // : dataDetail.status == "idle" ? <p style={{ fontWeight: 700, textAlign: "end", color: "var(--color-yellow)", margin: "10px 0" }}>{translate('waiting_approval', language) + " " + dataDetail.approval.waiting_for_user}</p>
                                : dataDetail.status == "idle" ? <p style={{ fontWeight: 700, textAlign: "end", color: "var(--color-yellow)", margin: "10px 0" }}>{translate('waiting_approval', language)}</p>
                                    : <p style={{ fontWeight: 700, textAlign: "end", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", margin: "10px 0" }}>{translate('canceled', language)}</p>
                    }
                </div>
            </div>

            {(dataDetail?.approval?.allow_reject && dataDetail?.approval?.allow_approve) && (
                <div style={{ width: "100%", height: "80px", borderTop: theme == "light" ? "1px solid var(--border-primary-gray)" : "1px solid #363636", background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", position: "fixed", bottom: "0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "90%", margin: "20px", gap: "20px" }}>
                        <Button
                            style={{
                                width: "50%",
                                backgroundColor: "var(--color-red)",
                                color: "white",
                                fontSize: "var(--font-sm)",
                                fontWeight: "700",
                                padding: "20px 0px",
                                textTransform: "capitalize",
                                borderRadius: "8px",
                                marginBottom: "10px"
                            }}
                            onClick={() => setIsRejectPopup(true)}
                        >
                            <p>{translate('reject_ubmission', language)}</p>
                        </Button>

                        <Button
                            style={{
                                width: "50%",
                                backgroundColor: "var(--color-green)",
                                color: "white",
                                fontSize: "var(--font-sm)",
                                fontWeight: "700",
                                padding: "20px 0px",
                                textTransform: "capitalize",
                                borderRadius: "8px",
                                marginBottom: "10px"
                            }}
                            onClick={() => setIsApprovePopup(true)}
                        >
                            <p>{translate('approve', language)}</p>
                        </Button>
                    </div>
                </div>
            )}

            <FullImagePopup
                opened={fullImagePopupOpened}
                onClose={() => setFullImagePopupOpened(false)}
                imageSrc={imagePopup}
            />

            <ConfirmPopup
                popupOpened={isApprovePopup}
                setPopupOpened={setIsApprovePopup}
                handleConfirm={handleConfirm}
                name={dataDetail.name}
                id={dataDetail.id}
            />

            <RejectedPopup
                popupOpened={isRejectPopup}
                setPopupOpened={setIsRejectPopup}
                handleConfirm={handleConfirm}
                setReasonReject={setReasonReject}
                reasonReject={reasonReject}
                id={dataDetail.id}
            />

            <LoadingPopup popupOpened={showLoading} setPopupOpened={setShowLoading} />
            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={selectedType != "reject" ? translate('approved_submission', language) : translate('rejected_submission', language)}
                message={selectedType != "reject" ? translate('approved_submission_text', language) : translate('rejected_submission_text', language)}
                imageAlert={theme == "light" && selectedType != "reject" ? ImageAlertLight : theme == "dark" && selectedType != "reject" ? ImageAlertDark : theme == "light" && selectedType == "reject" ? ImageAlertLight2 : ImageAlertDark2}
                btnCloseText={translate('close', language)}
            />
        </Page>
    )
}

export default OvertimeDetails
