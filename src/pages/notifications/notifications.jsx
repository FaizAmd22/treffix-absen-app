import { Button, Link, Page, Tab, Tabs, Toolbar, f7 } from 'framework7-react'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getRelativeTime } from '../../functions/getRelativeTime'
import { selectSettings } from '../../slices/settingsSlice'
import { API } from '../../api/axios'
import { selectLanguages } from '../../slices/languagesSlice'
import { translate } from '../../utils/translate'
import { labelFilter } from '../../functions/labelFilter'
import Loading from '../../components/loading'
import { setActiveTab } from '../../slices/tabSlice'
import { formatDate } from '../../functions/formatDate'
import NoData from '../../components/noData'
import ImageNoData from "../../assets/error/no-notification.svg";
import { updateCountNotif } from '../../slices/countNotifSlice'
import { truncateText } from '../../functions/truncateText'
import { selectActiveTabNotif, setActiveTabNotif } from '../../slices/tabNotifSlice'
import PermissionIcon from '../../icons/permission'
import ProcurementIcon from '../../icons/procurement'
import OvertimeIcon from '../../icons/overtime'
import ReimburseIcon from '../../icons/reimburse'

const NotificationsPage = () => {
    const [readData, setReadData] = useState([]);
    const [unreadData, setUnreadData] = useState([]);
    const [readDataRequest, setReadDataRequest] = useState([]);
    const [unreadDataRequest, setUnreadDataRequest] = useState([]);
    const [readDataRequestApprove, setReadDataRequestApprove] = useState([]);
    const [unreadDataRequestApprove, setUnreadDataRequestApprove] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const token = localStorage.getItem("token");
    const activeTabNotif = useSelector(selectActiveTabNotif)
    const dispatch = useDispatch()

    const getLatestDate = (createdAt, updatedAt) => {
        if (!updatedAt || updatedAt === createdAt) return createdAt;
        return new Date(updatedAt) > new Date(createdAt) ? updatedAt : createdAt;
    };

    const fetchNotif = async () => {
        setIsLoading(true)
        try {
            const response = await API.get("/notification", {
                params: {
                    limit: 100,
                    sort_by: "created_at desc"
                }
            });
            const data = response.data.payload;
            console.log("data notif :", data);
            if (data) {
                const news = data.filter(item => item.type !== "request" && item.type !== "request_approve" && (item.device === "mobile" || item.device === "all"))
                const request = data.filter(item => item.type === "request" && (item.device == "mobile" || item.device == "all"))
                const request_approve = data.filter(item => item.type === "request_approve" && (item.device == "mobile" || item.device == "all"))
                const unreadDataFilter = news.filter(item => item.is_read === false)
                const unreadDataRequestFilter = request.filter(item => item.is_read === false)
                const unreadDataRequestApproveFilter = request_approve.filter(item => item.is_read === false)
                dispatch(updateCountNotif(unreadDataFilter.length + unreadDataRequestFilter.length + unreadDataRequestApproveFilter.length))
                setReadData(news.filter(item => item.is_read === true))
                setUnreadData(unreadDataFilter)
                setReadDataRequest(request.filter(item => item.is_read === true))
                setUnreadDataRequest(unreadDataRequestFilter)
                setReadDataRequestApprove(request_approve.filter(item => item.is_read === true))
                setUnreadDataRequestApprove(unreadDataRequestApproveFilter)
            }
        } catch (error) {
            console.log("Data news tidak bisa diakses", error);
        } finally {
            setIsLoading(false)
        }
    };

    console.log("unreadDataRequestApprove :", unreadDataRequestApprove);

    const fetchScheduleId = async (idSchedule) => {
        setIsLoading(true)
        try {
            const response = await API.get(`/user-schedules/${idSchedule}`);
            const data = response.data.payload;

            localStorage.setItem('scheduleData', JSON.stringify(data))
        } catch (error) {
            console.log("Data news tidak bisa diakses", error);
        } finally {
            setIsLoading(false)
        }
    }

    const hitRead = async (id) => {
        try {
            const response = await API.put(`/notification/${id}`, {});

            console.log("response hittread:", response.data);
            fetchNotif()
        } catch (error) {
            console.log("Data news tidak bisa diakses", error);
        }
    }

    useEffect(() => {
        if (token) {
            fetchNotif()
        }
    }, [token]);

    const onRefresh = (done) => {
        setIsLoading(true);
        fetchNotif()
        setTimeout(() => {
            setIsLoading(false);
            done();
        }, 500);
    }

    const handleLinkNews = (id, idNotif, type, attachment) => {
        hitRead(idNotif)

        if (type == "news") {
            f7.views.main.router.navigate(`/news/${id}/notif/`);
        } else if (type == "development") {
            f7.views.main.router.navigate(`/training-detail/${id}/`);
        } else if (type == "recruitment" && attachment) {
            fetchScheduleId(attachment.data.id)
            f7.views.main.router.navigate("/card-schedule-detail/");
        }
    };

    const handleLinkRequest = (id, idNotif, type, notif, item) => {
        hitRead(idNotif)
        dispatch(setActiveTab('view-notif'))
        if (type == "leave" || type == "permission" || type == "reimbursement" || type == "procurement") {
            f7.views.main.router.navigate(`/notifications-detail/${id}/${type}/${notif}/`);
        } else if (type == "overtime") {
            localStorage.setItem("overtime_data", JSON.stringify(item));
            f7.views.main.router.navigate(`/overtime-detail/${id}/`)
        }
    };

    const filterImage = (type) => {
        if (type == "leave" || type == "permission") {
            return <PermissionIcon fillColor="var(--bg-primary-green)" width="60%" height="60%" />
        } else if (type == "reimbursement") {
            return <ReimburseIcon fillColor="var(--bg-primary-green)" width="60%" height="60%" />
        } else if (type == "procurement") {
            return <ProcurementIcon fillColor="var(--bg-primary-green)" width="60%" height="60%" />
        } else {
            return <OvertimeIcon fillColor="var(--bg-primary-green)" width="60%" height="60%" />
        }
    }

    const handleTabChange = (tabId) => {
        dispatch(setActiveTabNotif(tabId))
    };

    if (isLoading) {
        return (
            <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
                <div style={{ padding: "10px 18px", height: "85vh", overflow: "hidden", color: theme == "light" ? "black" : "white" }}>
                    <p style={{ fontSize: "var(--font-sm)", fontWeight: "700" }}>{translate('profile_notification', language)}</p>
                    <Loading height="80vh" />
                </div>
            </Page>
        )
    }

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <div style={{ padding: "10px 18px", color: theme == "light" ? "black" : "white" }}>
                <div className='pt-ios'>
                    <p style={{ fontSize: "var(--font-lg)", fontWeight: "700" }}>{translate('profile_notification', language)}</p>
                </div>

                <div
                    style={{
                        background: theme === "light" ? "#FAFAFA" : "#212121",
                        fontSize: "var(--font-xs)",
                        fontWeight: 700,
                        margin: "10px 0 5px 0",
                        borderRadius: "8px",
                        border: "none",
                        display: "flex",
                        padding: "4px",
                        gap: "10px"
                    }}
                >
                    <Button
                        onClick={() => handleTabChange("tab-1")}
                        style={{
                            flex: 1,
                            border: (activeTabNotif === "tab-1" && theme === "light") ? "1px solid white" : (activeTabNotif === "tab-1" && theme !== "light") ? "1px solid var(--bg-primary-green)" : "none",
                            padding: "0px 15px",
                            textTransform: "capitalize",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            fontWeight: 700,
                            background: (activeTabNotif === "tab-1" && theme === "light") ? "white" : (activeTabNotif === "tab-1" && theme !== "light") ? "var(--bg-primary-green-transparent)" : "transparent",
                            color: activeTabNotif === "tab-1" ? "var(--bg-primary-green)" : (theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)")
                        }}
                    >
                        General {unreadData.length > 0 ? `(${unreadData.length})` : unreadData.length >= 100 ? "(99+)" : null}
                    </Button>

                    <Button
                        onClick={() => handleTabChange("tab-2")}
                        style={{
                            flex: 1,
                            border: (activeTabNotif === "tab-2" && theme === "light") ? "1px solid white" : (activeTabNotif === "tab-2" && theme !== "light") ? "1px solid var(--bg-primary-green)" : "none",
                            padding: "0px 15px",
                            textTransform: "capitalize",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            fontWeight: 700,
                            background: (activeTabNotif === "tab-2" && theme === "light") ? "white" : (activeTabNotif === "tab-2" && theme !== "light") ? "var(--bg-primary-green-transparent)" : "transparent",
                            color: activeTabNotif === "tab-2" ? "var(--bg-primary-green)" : (theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)")
                        }}
                    >
                        Request {unreadDataRequest.length > 0 ? `(${unreadDataRequest.length})` : unreadDataRequest.length >= 100 ? "(99+)" : null}
                    </Button>

                    {(readDataRequestApprove.length > 0 || unreadDataRequestApprove.length > 0) && (
                        <Button
                            onClick={() => handleTabChange("tab-3")}
                            style={{
                                flex: 1,
                                border: (activeTabNotif === "tab-3" && theme === "light") ? "1px solid white" : (activeTabNotif === "tab-3" && theme !== "light") ? "1px solid var(--bg-primary-green)" : "none",
                                padding: "0px 15px",
                                textTransform: "capitalize",
                                borderRadius: "6px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                fontWeight: 700,
                                background: (activeTabNotif === "tab-3" && theme === "light") ? "white" : (activeTabNotif === "tab-3" && theme !== "light") ? "var(--bg-primary-green-transparent)" : "transparent",
                                color: activeTabNotif === "tab-3" ? "var(--bg-primary-green)" : (theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)")
                            }}
                        >
                            Approval {unreadDataRequestApprove.length > 0 ? `(${unreadDataRequestApprove.length})` : unreadDataRequestApprove.length >= 100 ? "(99+)" : null}
                        </Button>
                    )}
                </div>

                <div style={{ width: "100%" }}>
                    <div
                        style={{
                            display: activeTabNotif === "tab-1" ? "block" : "none",
                            width: "100%",
                            marginBottom: "40px"
                        }}
                    >
                        {(unreadData.length <= 0 && readData.length <= 0) ? (
                            <NoData image={ImageNoData} title={translate('no_data_general', language)} />
                        ) : (
                            <div>
                                <div style={{ width: "100%" }}>
                                    <p style={{ fontSize: "var(--font-sm)", fontWeight: "700" }}>{translate('latest', language)}</p>

                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        {
                                            unreadData.map((item, index) => {
                                                const latestDate = getLatestDate(item.created_at, item.updated_at);

                                                return (
                                                    <div onClick={() => handleLinkNews(item.attachments.data.id, item.id, item.type, item.attachments)} key={index} style={{ width: "87%", padding: "15px", background: theme == "light" ? "transparent" : "var(--bg-secondary-gray)", marginBottom: "15px", borderRadius: "12px", boxShadow: "0 2px 10px 0 rgba(0,0,0,0.1)" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <p style={{ fontSize: "var(--font-xs)", fontWeight: 400, margin: 0, marginBottom: "10px", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)" }}>{getRelativeTime(latestDate, language)}</p>

                                                            <div style={{ background: "var(--bg-primary-green)", width: "10px", height: "10px", borderRadius: "50%" }} />
                                                        </div>
                                                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700, margin: 0, marginBottom: "5px" }}>{item?.title}</p>
                                                        <p style={{ fontSize: "var(--font-sm)", margin: 0 }}>{truncateText(item?.text)}</p>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>

                                <div style={{ width: "100%" }}>
                                    <p style={{ fontSize: "var(--font-sm)", fontWeight: "700" }}>{translate('already_read', language)}</p>

                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        {
                                            readData.map((item, index) => {
                                                const latestDate = getLatestDate(item.created_at, item.updated_at);

                                                return (
                                                    <div onClick={() => handleLinkNews(item.attachments.data.id, item.id, item.type, item.attachments)} key={index} style={{ width: "87%", padding: "15px", background: theme == "light" ? "transparent" : "var(--bg-secondary-gray)", marginBottom: "10px", borderRadius: "12px", boxShadow: "0 1px 4px 0 rgba(0,0,0,0.1)", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", opacity: "0.8" }}>
                                                        <p style={{ fontSize: "var(--font-xs)", fontWeight: 400, margin: 0, marginBottom: "10px", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)" }}>{getRelativeTime(latestDate, language)}</p>
                                                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700, margin: 0, marginBottom: "5px" }}>{item?.title}</p>
                                                        <p style={{ fontSize: "var(--font-sm)", margin: 0 }}>{truncateText(item?.text)}</p>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            display: activeTabNotif === "tab-2" ? "block" : "none",
                            width: "100%"
                        }}
                    >
                        {(unreadDataRequest.length <= 0 && readDataRequest.length <= 0) ? (
                            <NoData image={ImageNoData} title={translate('no_data_request', language)} />
                        ) : (
                            <div>
                                <div>
                                    <p style={{ fontSize: "var(--font-sm)", fontWeight: "700" }}>{translate('latest', language)}</p>

                                    <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                                        {
                                            unreadDataRequest.map((item, index) => (
                                                <div onClick={() => handleLinkRequest(item.attachments.data.id, item.id, item.attachments.data.type, "notif", item)} key={index} style={{ width: "95%", background: theme == "light" ? "transparent" : "var(--bg-secondary-gray)", marginBottom: "15px", borderRadius: "12px", boxShadow: "0 2px 10px 0 rgba(0,0,0,0.1)" }}>
                                                    <div style={{ width: "100%", borderBottom: theme == "light" ? "1px solid #F5F5F5" : "1px solid var(--bg-secondary-gray)" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", fontSize: "var(--font-xs)", fontWeight: 400, padding: "15px" }}>
                                                            <p style={{ margin: "2px" }}>{formatDate(item.created_at, language)}</p>

                                                            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                                                <p style={{
                                                                    margin: "2px",
                                                                    fontWeight: 700,
                                                                    marginLeft: "5px",
                                                                    padding: "5px 12px",
                                                                    borderRadius: "360px",
                                                                    fontSize: "var(--font-xxs)",
                                                                    background: (item.status == "idle" && theme == "light") ? "var(--color-bg-yellow)"
                                                                        : (item.status == "approved" && theme == "light") ? "var(--color-bg-green)"
                                                                            : (item.status == "rejected" && theme == "light") ? "var(--color-bg-red)"
                                                                                : (item.status == "idle" && theme != "light") ? "var(--color-bg-tr-yellow)"
                                                                                    : (item.status == "approved" && theme != "light") ? "var(--color-bg-tr-green)"
                                                                                        : (item.status == "rejected" && theme != "light") ? "var(--color-bg-tr-red)"
                                                                                            : "var(--color-bg-dark-gray)",
                                                                    color: item.status == "idle" ? "var(--color-yellow)"
                                                                        : item.status == "approved" ? "var(--color-green)"
                                                                            : item.status == "rejected" ? "var(--color-red)"
                                                                                : "var(--color-dark-gray)",
                                                                }}>
                                                                    {labelFilter(item.status, language)}
                                                                </p>

                                                                <div style={{ background: "var(--bg-primary-green)", width: "10px", height: "10px", borderRadius: "50%" }} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "grid", gridTemplateColumns: "15% 80%", alignItems: "center", gap: "10px", padding: "15px" }}>
                                                        <div style={{ background: "var(--bg-primary-green-transparent)", width: "45px", height: "45px", borderRadius: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            {/* <img src={filterImage(item.attachments.data.type)} alt="OffIcon" style={{ width: "60%", height: "60%", objectFit: "cover" }} /> */}
                                                            {filterImage(item.attachments.data.type)}
                                                        </div>

                                                        <p style={{ fontSize: "var(--font-sm)", fontWeight: 700, margin: 0 }}>{item?.title}</p>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                <div>
                                    <p style={{ fontSize: "var(--font-sm)", fontWeight: "700" }}>{translate('already_read', language)}</p>

                                    <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                                        {
                                            readDataRequest.map((item, index) => (
                                                <div onClick={() => handleLinkRequest(item.attachments.data.id, item.id, item.attachments.data.type, "notif", item)} key={index} style={{ width: "95%", background: theme == "light" ? "transparent" : "var(--bg-secondary-gray)", marginBottom: "15px", borderRadius: "12px", boxShadow: "0 1px 4px 0 rgba(0,0,0,0.1)", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", opacity: "0.8" }}>
                                                    <div style={{ width: "100%", borderBottom: theme == "light" ? "1px solid #F5F5F5" : "1px solid var(--bg-secondary-gray)" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", fontSize: "var(--font-xs)", fontWeight: 400, padding: "15px" }}>
                                                            <p style={{ margin: "2px" }}>{formatDate(item.created_at, language)}</p>

                                                            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                                                <p style={{
                                                                    margin: "2px",
                                                                    fontWeight: 700,
                                                                    marginLeft: "5px",
                                                                    padding: "5px 12px",
                                                                    borderRadius: "360px",
                                                                    fontSize: "var(--font-xxs)",
                                                                    background: (item.status == "idle" && theme == "light") ? "var(--color-bg-yellow)"
                                                                        : (item.status == "approved" && theme == "light") ? "var(--color-bg-green)"
                                                                            : (item.status == "rejected" && theme == "light") ? "var(--color-bg-red)"
                                                                                : (item.status == "idle" && theme != "light") ? "var(--color-bg-tr-yellow)"
                                                                                    : (item.status == "approved" && theme != "light") ? "var(--color-bg-tr-green)"
                                                                                        : (item.status == "rejected" && theme != "light") ? "var(--color-bg-tr-red)"
                                                                                            : "var(--color-bg-dark-gray)",
                                                                    color: item.status == "idle" ? "var(--color-yellow)"
                                                                        : item.status == "approved" ? "var(--color-green)"
                                                                            : item.status == "rejected" ? "var(--color-red)"
                                                                                : "var(--color-dark-gray)",
                                                                }}>
                                                                    {labelFilter(item.status, language)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "grid", gridTemplateColumns: "15% 80%", alignItems: "center", gap: "10px", padding: "15px" }}>
                                                        <div style={{ background: "var(--bg-primary-green-transparent)", width: "45px", height: "45px", borderRadius: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            {filterImage(item.attachments.data.type)}
                                                        </div>

                                                        <p style={{ fontSize: "var(--font-sm)", fontWeight: 700, margin: 0 }}>{item?.title}</p>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            display: activeTabNotif === "tab-3" ? "block" : "none",
                            width: "100%"
                        }}
                    >
                        {(unreadDataRequestApprove.length <= 0 && readDataRequestApprove.length <= 0) ? (
                            <NoData image={ImageNoData} title={translate('no_data_approval', language)} />
                        ) : (
                            <div>
                                <div>
                                    <p style={{ fontSize: "var(--font-sm)", fontWeight: "700" }}>{translate('latest', language)}</p>

                                    <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                                        {
                                            unreadDataRequestApprove.map((item, index) => (
                                                <div onClick={() => handleLinkRequest(item.attachments.data.id, item.id, item.attachments.data.type, "notif2", item)} key={index} style={{ width: "95%", background: theme == "light" ? "transparent" : "var(--bg-secondary-gray)", marginBottom: "15px", borderRadius: "12px", boxShadow: "0 2px 10px 0 rgba(0,0,0,0.1)" }}>
                                                    <div style={{ width: "100%", borderBottom: theme == "light" ? "1px solid #F5F5F5" : "1px solid var(--bg-secondary-gray)" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", fontSize: "var(--font-xs)", fontWeight: 400, padding: "15px" }}>
                                                            <p style={{ margin: "2px" }}>{formatDate(item.created_at, language)}</p>

                                                            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                                                <p style={{
                                                                    margin: "2px",
                                                                    fontWeight: 700,
                                                                    marginLeft: "5px",
                                                                    padding: "5px 12px",
                                                                    borderRadius: "360px",
                                                                    fontSize: "var(--font-xxs)",
                                                                    background: (item.status == "idle" && theme == "light") ? "var(--color-bg-yellow)"
                                                                        : (item.status == "approved" && theme == "light") ? "var(--color-bg-green)"
                                                                            : (item.status == "rejected" && theme == "light") ? "var(--color-bg-red)"
                                                                                : (item.status == "idle" && theme != "light") ? "var(--color-bg-tr-yellow)"
                                                                                    : (item.status == "approved" && theme != "light") ? "var(--color-bg-tr-green)"
                                                                                        : (item.status == "rejected" && theme != "light") ? "var(--color-bg-tr-red)"
                                                                                            : "var(--color-bg-dark-gray)",
                                                                    color: item.status == "idle" ? "var(--color-yellow)"
                                                                        : item.status == "approved" ? "var(--color-green)"
                                                                            : item.status == "rejected" ? "var(--color-red)"
                                                                                : "var(--color-dark-gray)",
                                                                }}>
                                                                    {labelFilter(item.status, language)}
                                                                </p>

                                                                <div style={{ background: "var(--bg-primary-green)", width: "10px", height: "10px", borderRadius: "50%" }} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "grid", gridTemplateColumns: "15% 80%", alignItems: "center", gap: "10px", padding: "15px", paddingBottom: 0 }}>
                                                        <div style={{ background: "var(--bg-primary-green-transparent)", width: "45px", height: "45px", borderRadius: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            {filterImage(item.attachments.data.type)}
                                                        </div>

                                                        <p style={{ fontSize: "var(--font-sm)", fontWeight: 700, margin: 0 }}>{item?.title}</p>
                                                    </div>

                                                    <p style={{ padding: "15px", paddingTop: 0, marginTop: "5px" }}>{translate('who_submitted', language)}: <b style={{ marginLeft: "3px" }}>{item.attachments.data.name}</b></p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                <div>
                                    <p style={{ fontSize: "var(--font-sm)", fontWeight: "700" }}>{translate('already_read', language)}</p>

                                    <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                                        {
                                            readDataRequestApprove.map((item, index) => (
                                                <div onClick={() => handleLinkRequest(item.attachments.data.id, item.id, item.attachments.data.type, "notif2", item)} key={index} style={{ width: "95%", background: theme == "light" ? "transparent" : "var(--bg-secondary-gray)", marginBottom: "15px", borderRadius: "12px", boxShadow: "0 1px 4px 0 rgba(0,0,0,0.1)", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", opacity: "0.8" }}>
                                                    <div style={{ width: "100%", borderBottom: theme == "light" ? "1px solid #F5F5F5" : "1px solid var(--bg-secondary-gray)" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", fontSize: "var(--font-xs)", fontWeight: 400, padding: "15px" }}>
                                                            <p style={{ margin: "2px" }}>{formatDate(item.created_at, language)}</p>

                                                            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                                                <p style={{
                                                                    margin: "2px",
                                                                    fontWeight: 700,
                                                                    marginLeft: "5px",
                                                                    padding: "5px 12px",
                                                                    borderRadius: "360px",
                                                                    fontSize: "var(--font-xxs)",
                                                                    background: (item.status == "idle" && theme == "light") ? "var(--color-bg-yellow)"
                                                                        : (item.status == "approved" && theme == "light") ? "var(--color-bg-green)"
                                                                            : (item.status == "rejected" && theme == "light") ? "var(--color-bg-red)"
                                                                                : (item.status == "idle" && theme != "light") ? "var(--color-bg-tr-yellow)"
                                                                                    : (item.status == "approved" && theme != "light") ? "var(--color-bg-tr-green)"
                                                                                        : (item.status == "rejected" && theme != "light") ? "var(--color-bg-tr-red)"
                                                                                            : "var(--color-bg-dark-gray)",
                                                                    color: item.status == "idle" ? "var(--color-yellow)"
                                                                        : item.status == "approved" ? "var(--color-green)"
                                                                            : item.status == "rejected" ? "var(--color-red)"
                                                                                : "var(--color-dark-gray)",
                                                                }}>
                                                                    {labelFilter(item.status, language)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "grid", gridTemplateColumns: "15% 80%", alignItems: "center", gap: "10px", padding: "15px", paddingBottom: 0 }}>
                                                        <div style={{ background: "var(--bg-primary-green-transparent)", width: "45px", height: "45px", borderRadius: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            {filterImage(item.attachments.data.type)}
                                                        </div>

                                                        <p style={{ fontSize: "var(--font-sm)", fontWeight: 700, margin: 0 }}>{item?.title}</p>
                                                    </div>

                                                    <p style={{ padding: "15px", paddingTop: 0, marginTop: "5px" }}>{translate('who_submitted', language)}: <b style={{ marginLeft: "3px" }}>{item.attachments.data.name}</b></p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Page>
    )
}

export default NotificationsPage