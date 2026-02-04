import React, { useEffect, useState } from 'react';
import { Button, f7, Link, Page } from 'framework7-react';
import { API } from '../../../api/axios';
import Loading from '../../../components/loading';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import FullImagePopup from '../../../components/fullImagePopup';
import ProofPopupPersonal from '../../profile/pages/dataPersonal/components/proofPopupPersonal'
import DetailPermission from './detailPermission';
import DetailProcurement from './detailProcurement';
import DetailReimbursement from './detailReimbursement';
import ConfirmPopup from './confirmPopup'
import RejectedPopup from './rejectPopup';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { selectActiveTab } from '../../../slices/tabSlice';
import { showToast, showToastFailed } from '../../../functions/toast';
import LoadingPopup from '../../../components/loadingPopup';
import MessageAlert from '../../../components/messageAlert';
import ButtonFixBottom from '../../../components/buttonFixBottom';
import CustomButton from '../../../components/customButton';
import ImageAlertLight from '../../../assets/messageAlert/absen-light.png'
import ImageAlertDark from '../../../assets/messageAlert/absen-dark.png'
import ImageAlertLight2 from '../../../assets/messageAlert/cancel-light.png'
import ImageAlertDark2 from '../../../assets/messageAlert/cancel-dark.png'

const NotificationsDetail = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [detailData, setDetailData] = useState(null);
    const [leaveType, setLeaveType] = useState(null);
    const [reasonReject, setReasonReject] = useState(null);
    const [documentFileImage, setDocumentFileImage] = useState(null);
    const [docPopupOpened, setDocPopupOpened] = useState(false);
    const [fullImagePopupOpened, setFullImagePopupOpened] = useState(false);
    const [isApprovePopup, setIsApprovePopup] = useState(false);
    const [isRejectPopup, setIsRejectPopup] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [sheetOpened, setSheetOpened] = useState(false);
    const activeTab = useSelector(selectActiveTab);
    const currentRoute = f7.views.main.router.currentRoute;

    const { id, type, backto } = f7.views.main.router.currentRoute.params;
    const token = localStorage.getItem("token");

    // console.log("type :", type);
    // console.log("reasonReject :", reasonReject);
    // console.log("activeTab :", activeTab);
    // console.log("current route", currentRoute.url);

    console.log("detailData approval : ", detailData?.approval?.allow_approve);



    const closeDocPopup = () => setDocPopupOpened(false);
    const handleOpenPopup = (image) => {
        setDocumentFileImage(image);
        setDocPopupOpened(true);
    };

    const openFullImagePopup = () => setFullImagePopupOpened(true);
    const closeFullImagePopup = () => {
        setFullImagePopupOpened(false);
        setDocPopupOpened(true);
    }

    const openLinkInBrowser = () => {
        window.open(data.url, "_blank");
    };

    // useEffect(() => {
    //     if (showLoading) {
    //         f7.dialog.preloader('Loading...');
    //     } else {
    //         f7.dialog.close();
    //     }
    // }, [showLoading]);

    const handleConfirm = async (selectedId, types) => {
        setShowLoading(true)
        setSelectedType(types)
        setIsApprovePopup(false)
        setIsRejectPopup(false)
        const url = types === "approve"
            ? `/form-request-approve/${selectedId}`
            : `/form-request-reject/${selectedId}`;

        const rejctedPayload = { status_note: reasonReject }
        const payload = types == "reject" ? rejctedPayload : null
        console.log(`Payload confirm approve/reject :`, payload);

        try {
            const response = await API.put(url, payload);

            console.log(`Request ${types} berhasil:`, response.data);
            setShowLoading(false)
            // f7.dialog.alert(`Request berhasil di-${types === "approve" ? "setujui" : "tolak"}.`);
            const messageAlert = types == "reject" ? "Pengajuan ditolak, karyawan yang bersangkutan akan menerima notifikasi bahwa pengajuannya telah ditolak." : "Pengajuan berhasil disetujui, karyawan akan menerima notifikasi bahwa pengajuan mereka diterima."
            // showToast(messageAlert, theme)
            setSheetOpened(true)
        } catch (error) {
            console.error(`Gagal ${types} request:`, error);
            setShowLoading(false)
            // f7.dialog.alert(`Terjadi kesalahan saat memproses request.`);
            showToastFailed(translate('request_failed', language))
        }

        setIsApprovePopup(false);
        setIsRejectPopup(false);
        f7.views.main.router.refreshPage()
    };

    const fetchNotifDetail = async () => {
        setIsLoading(true)
        try {
            let endpoint = '';

            if (type === 'reimbursement') {
                endpoint = `/form-request-reimbursement/${id}`;
            } else if (type === 'leave' || type === 'permission') {
                endpoint = `/form-request-leave/${id}`;
            } else if (type === 'procurement') {
                endpoint = `/form-request-procurement/${id}`;
            } else {
                throw new Error('Unknown notification type');
            }

            const response = await API.get(endpoint);

            console.log("Detail data:", response.data);
            const data = response.data.payload
            setDetailData(data);
            setError(null);

            if (type === 'leave' || type === 'permission') {
                fetchLeaveOfType(data.type_of_leave)
            }
        } catch (error) {
            console.error("Tidak dapat mengambil detail notifikasi:", error);
            setError(translate('training_detail_failed_getdetail', language));
        } finally {
            setIsLoading(false)
        }
    };
    console.log("detailData:", detailData);

    const fetchLeaveOfType = async (code) => {
        const cond = { "code": `${code}` };
        try {
            const response = await API.get("/type-of-leave", {
                params: {
                    page: 1,
                    sort_by: "created_at desc",
                    cond: JSON.stringify(cond),
                    limit: 100,
                },
            });

            console.log("response options :", response.data.payload);
            setLeaveType(response.data.payload[0].name)
        } catch (error) {
            console.log("Data options tidak bisa diakses", error);
        }
    };

    useEffect(() => {
        fetchNotifDetail();
    }, [id, type]);

    const handleLink = () => {
        if (backto === 'home') {
            f7.views.main.router.navigate('/home/', {
                reloadCurrent: false,
                replaceState: true,
                clearPreviousHistory: true,
                props: {
                    targetTab: 'view-home'
                }
            });
        } else if (backto === 'notif') {
            f7.views.main.router.navigate('/home/', {
                reloadCurrent: false,
                clearPreviousHistory: true,
                props: {
                    targetTab: 'view-notif',
                    internalTab: 'tab-2'
                }
            });
        } else if (backto === 'notif2') {
            f7.views.main.router.navigate('/home/', {
                reloadCurrent: false,
                clearPreviousHistory: true,
                props: {
                    targetTab: 'view-notif',
                    internalTab: 'tab-3'
                }
            });
        }
    }

    if (isLoading) {
        return (
            <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
                <div style={{ padding: "15px", marginBottom: "20px", fontSize: "var(--font-sm)", color: theme == "light" ? "black" : "white" }}>
                    <Link
                        back
                        style={{ color: theme === "light" ? "black" : "white" }}
                    >
                        <IoIosArrowRoundBack size={"25px"} style={{ marginRight: "10px" }} />
                        <p style={{ fontSize: "var(--font-lg)", fontWeight: "600" }}>{translate('submission_details', language)}</p>
                    </Link>

                    <Loading height="80vh" />
                </div>
            </Page>
        )
    }

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            {detailData && (
                <>
                    <div style={{ padding: "15px", marginBottom: "20px", fontSize: "var(--font-sm)", color: theme == "light" ? "black" : "white" }}>
                        <Link
                            back
                            style={{ color: theme === "light" ? "black" : "white" }}
                        >
                            <IoIosArrowRoundBack size={"25px"} style={{ marginRight: "10px" }} />
                            <p style={{ fontSize: "var(--font-sm)", fontWeight: "600" }}>{translate('submission_details', language)}</p>
                        </Link>

                        {error && <div>{error}</div>}
                        {type === 'reimbursement' && (
                            <DetailReimbursement item={detailData} handleOpenPopup={handleOpenPopup} />
                        )}

                        {(type === 'leave' || type === 'permission') && (
                            <DetailPermission item={detailData} leaveType={leaveType} handleOpenPopup={handleOpenPopup} />
                        )}

                        {type === 'procurement' && (
                            <DetailProcurement item={detailData} openLinkInBrowser={openLinkInBrowser} />
                        )}
                    </div>

                    {detailData?.approval?.allow_approve && detailData.status !== "canceled" && (
                        <ButtonFixBottom needBorderTop={true}>
                            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: "20px" }}>
                                <CustomButton
                                    color={"white"}
                                    bg={"var(--color-red)"}
                                    text={translate('reject_ubmission', language)}
                                    handleClick={() => setIsRejectPopup(true)}
                                    disable
                                />

                                <CustomButton
                                    color={"white"}
                                    bg={"var(--color-green)"}
                                    text={translate('approve', language)}
                                    handleClick={() => setIsApprovePopup(true)}
                                    disable
                                />
                            </div>
                        </ButtonFixBottom>
                    )}

                    <ProofPopupPersonal
                        title={translate('submission_permission_supporting_documents', language)}
                        opened={docPopupOpened}
                        onClose={closeDocPopup}
                        onViewImage={openFullImagePopup}
                    />

                    <FullImagePopup
                        opened={fullImagePopupOpened}
                        onClose={closeFullImagePopup}
                        imageSrc={documentFileImage}
                    />

                    <ConfirmPopup
                        popupOpened={isApprovePopup}
                        setPopupOpened={setIsApprovePopup}
                        handleConfirm={handleConfirm}
                        name={detailData.name}
                        id={detailData.id}
                    />

                    <RejectedPopup
                        popupOpened={isRejectPopup}
                        setPopupOpened={setIsRejectPopup}
                        handleConfirm={handleConfirm}
                        reasonReject={reasonReject}
                        setReasonReject={setReasonReject}
                        id={detailData.id}
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
                </>
            )}
        </Page>
    );
};

export default NotificationsDetail;