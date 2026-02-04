import React, { useEffect, useState } from 'react';
import { Block, Button, f7, Link } from 'framework7-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { formatDate } from '../../../functions/formatDate';
import { API } from '../../../api/axios';
import { getRelativeTime } from '../../../functions/getRelativeTime';
import { getPlainTextDashboard } from '../../../functions/getPlainText';
import { setActiveTab } from '../../../slices/tabSlice';
import { getHoursMinutes } from '../../../functions/getHoursMinutes';
import CardIdle from './cardIdle';
import { setAbsentIn, setAbsentOut } from '../../../slices/absentSlice';
import { generateMonths } from '../../attendance/attendance';
import { createReminder } from '../../../functions/notification';
import { selectUser } from '../../../slices/userSlice';
import MessageAlert from '../../../components/messageAlert';
import { setActiveTabNotif } from '../../../slices/tabNotifSlice';
import AttendanceIcon from '../../../icons/attendance';
import PermissionIcon from '../../../icons/permission';
import PayrollIcon from '../../../icons/payroll';
import ProcurementIcon from '../../../icons/procurement';
import DevelopmentIcon from '../../../icons/development';
import VisitIcon from '../../../icons/visit';
import OvertimeIcon from '../../../icons/overtime';
import ReimburseIcon from '../../../icons/reimburse';
import BgIcon from '../../../icons/bgIcon';
import ImageAlertLight from '../../../assets/messageAlert/cancel-light.png'
import ImageAlertDark from '../../../assets/messageAlert/cancel-dark.png'

const Dashboard = ({ isRefresh }) => {
    const [dataNews, setDataNews] = useState([])
    const [attendanceToday, setAttendanceToday] = useState([])
    const [dataApproval, setDataApproval] = useState([])
    const [dataIdle, setDataIdle] = useState([])
    const [leaveTypes, setLeaveTypes] = useState([])
    const [isloading, setIsloading] = useState(false)
    const [isAbsenIn, setIsAbsenIn] = useState(true)
    const [isOvertimeIn, setIsOvertimeIn] = useState(true)
    const [isOvertime, setIsOvertime] = useState(false)
    const [overtimeIn, setOvertimeIn] = useState(null)
    const [overtimeOut, setOvertimeOut] = useState(null)
    const [isSwiperActive, setIsSwiperActive] = useState(0)
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const userData = useSelector(selectUser)
    const token = localStorage.getItem("token")
    const dispatch = useDispatch()
    const today = new Date();
    const absenIn = attendanceToday.clock_in
    const absenOut = attendanceToday.clock_out
    const [sheetOpened, setSheetOpened] = useState(false);
    // console.log("absenOut :", absenOut);
    // console.log("isRefresh :", isRefresh);
    // console.log("isAbsenIn :", isAbsenIn);

    const months = generateMonths(language);
    const currentMonthIndex = months.length - 1;
    const currentMonth = months[currentMonthIndex];
    const [attendanceData, setAttendanceData] = useState([]);
    const getToday = attendanceData.find(item => item.date == attendanceToday.attendance_date)
    // console.log("getToday :", getToday);


    const checkAbsen = (data) => {
        const absenComplete = data.clock_in && data.clock_out
        if (!data.clock_in || absenComplete) {
            setIsAbsenIn(true)
        } else {
            setIsAbsenIn(false)
        }
    }

    const checkOvertime = (data) => {
        const overtimeComplete = data.clock_in && data.clock_out
        if (!data.clock_in || overtimeComplete) {
            setIsOvertimeIn(true)
        } else {
            setIsOvertimeIn(false)
        }
    }

    const handleAbsen = () => {
        // console.log("isOvertime :", isOvertime);
        // console.log("isOvertimeIn :", isOvertimeIn);
        // console.log("isAbsenIn :", isAbsenIn);

        if ((isOvertime && !isOvertimeIn) && isAbsenIn) {
            setSheetOpened(true)
        } else {
            f7.views.main.router.navigate("/face-recognize/", { clearPreviousHistory: true });
        }
    };

    const handleLink = (id) => {
        f7.views.main.router.navigate(`/news/${id}/home/`);
    }

    const getLatestDate = (createdAt, updatedAt) => {
        if (!updatedAt || updatedAt === createdAt) return createdAt;
        return new Date(updatedAt) > new Date(createdAt) ? updatedAt : createdAt;
    };

    const isLinked = (link, coming) => {
        if (!coming) {
            dispatch(setActiveTab('view-home'))
            f7.views.main.router.navigate(link)
        }
    }

    const fetchNotif = async () => {
        try {
            const response = await API.get("/mobile/form-request-all", {
                params: {
                    sort_by: "created_at desc",
                    limit: 3
                }
            });
            const data = response.data.payload;
            const idle = data.filter(item => item.status == "idle")
            // console.log("data notif :", data);
            setDataApproval(data)
            setDataIdle(idle)
        } catch (error) {
            // console.log("Data news tidak bisa diakses", error);
        }
    };


    const hitRead = async (id) => {
        try {
            const response = await API.put(`/notification/${id}`, {});

            // console.log("response hittread:", response.data);
            fetchNotif()
        } catch (error) {
            // console.log("Data news tidak bisa diakses", error);
        }
    }

    const handleLinkRequest = (id, type, item) => {
        const notifNumbers = JSON.parse(localStorage.getItem('notificationData')) || [];
        const matchedNotif = notifNumbers.find(item => item.idContent === id);
        // console.log("id handleLinkRequest :", id);
        // console.log("notifNumbers :", notifNumbers);
        // console.log("matchedNotif :", matchedNotif);


        if (matchedNotif) {
            hitRead(matchedNotif.idNotif);
            // console.log(`Found matching notification: idContent=${id}, idNotif=${matchedNotif.idNotif}`);
        } else {
            hitRead(id);
            // console.log(`No matching notification found for idContent=${id}, using original id`);
        }

        dispatch(setActiveTab('view-home'));
        if (type == "overtime") {
            localStorage.setItem("overtime_data", JSON.stringify(item));
            f7.views.main.router.navigate(`/overtime-detail/${id}/`)
        } else {
            f7.views.main.router.navigate(`/notifications-detail/${id}/${type}/home/`);
        }
    };

    const fetchNews = async () => {
        const cond = { "status": "active" }

        try {
            const response = await API.get("/news", {
                params: {
                    page: 1,
                    cond: JSON.stringify(cond),
                    sort_by: "release_date desc",
                    limit: 4,
                },
            });

            // console.log("reimburse category :", response.data.payload);
            const data = response.data.payload
            setDataNews(data)
        } catch (error) {
            // console.log("Data options tidak bisa diakses", error);
        }
    };

    const fetchAttendanceData = async () => {
        try {
            const response = await API.get(`/mobile/attendances/user?limit=100&cond={"attendance_at[month]":"${currentMonth.dateKey}"}&sort_by=attendance_at desc`);
            const data = response.data.payload;
            const filter = data.filter(item => item.status !== "offin")
            // console.log("data card: ", filter);
            setAttendanceData(filter)
        } catch (err) {
            console.error("Failed to fetch card data", err);
            setAttendanceData([])
        }
    };

    const fetchAbsen = async () => {
        setIsloading(true)

        try {
            const response = await API.get("/mobile/attendances/user-today");

            // console.log("fetch absen :", response.data.payload);
            const data = response.data.payload
            setAttendanceToday(data)

            checkAbsen(data)
            dispatch(setAbsentIn(data.clock_in || null));
            dispatch(setAbsentOut(data.clock_out || null));
        } catch (error) {
            // console.log("Data options tidak bisa diakses", error);
        }
    };

    const parseOvertimeTime = (isoString) => {
        return new Date(isoString);
    };

    const scheduleOvertimeReminders = (shiftsData, userData) => {
        const isReminderAttendance = localStorage.getItem('reminderAttendance');
        const isHasReminder = localStorage.getItem('isHasReminder')
        if (!isReminderAttendance || isReminderAttendance === "false") {
            // console.log("Reminder overtime dinonaktifkan");
            return;
        }

        if (!isHasReminder || isHasReminder === "false") {
            // console.log("Reminder overtime sudah ada");
            return;
        }

        if (shiftsData.is_overtime) {
            const overtimeStart = parseOvertimeTime(shiftsData.start_overtime);
            const reminderOvertimeIn = new Date(overtimeStart.getTime() - 10 * 60 * 1000);
            const delayOvertimeIn = reminderOvertimeIn.getTime() - Date.now();

            // console.log("Current time:", new Date().toISOString());
            // console.log("overtimeStart:", overtimeStart.toISOString());
            // console.log("reminderOvertimeIn:", reminderOvertimeIn.toISOString());
            // console.log("delayOvertimeIn (minutes):", delayOvertimeIn / 60000);

            if (delayOvertimeIn > 0) {
                // console.log("Reminder overtime masuk akan muncul dalam " + (delayOvertimeIn / 60000) + " menit");

                createReminder(
                    "Ingat, lembur akan dimulai sebentar lagi. Segera bersiap!",
                    reminderOvertimeIn.getTime(),
                    {
                        email: userData.email,
                        title: `Reminder Overtime Masuk`,
                    }
                );
            } else {
                // console.log("Waktu reminder overtime masuk sudah lewat");
            }

            const overtimeEnd = parseOvertimeTime(shiftsData.end_overtime);
            const reminderOvertimeOut = new Date(overtimeEnd.getTime() - 10 * 60 * 1000);
            const delayOvertimeOut = reminderOvertimeOut.getTime() - Date.now();

            // console.log("overtimeEnd:", overtimeEnd.toISOString());
            // console.log("reminderOvertimeOut:", reminderOvertimeOut.toISOString());
            // console.log("delayOvertimeOut (minutes):", delayOvertimeOut / 60000);

            if (delayOvertimeOut > 0) {
                // console.log("Reminder overtime keluar akan muncul dalam " + (delayOvertimeOut / 60000) + " menit");

                createReminder(
                    "Lembur akan segera berakhir. Jangan lupa absen keluar jika perlu!",
                    reminderOvertimeOut.getTime(),
                    {
                        email: userData.email,
                        title: `Reminder Overtime Keluar`,
                    }
                );
            } else {
                // console.log("Waktu reminder overtime keluar sudah lewat");
            }
        }
        localStorage.setItem('isHasReminder', true)
    };

    const fetchOvertimeTime = async () => {
        setIsloading(true)

        try {
            const response = await API.get("/mobile/attendances/overtime-today");

            // console.log("fetch Overtime time :", response.data.payload);
            const data = response.data.payload

            checkOvertime(data)
            setOvertimeIn(data.clock_in)
            setOvertimeOut(data.clock_out)
        } catch (error) {
            // console.log("Data options tidak bisa diakses", error);
        }
    };

    const fetchOvertime = async () => {
        setIsloading(true)

        try {
            const response = await API.get("/mobile/form-request-check-overtime");

            // console.log("fetch overtime :", response.data.payload);
            const data = response.data.payload
            setIsOvertime(data.is_overtime)
            fetchOvertimeTime()
            scheduleOvertimeReminders(data, userData)
        } catch (error) {
            // console.log("Data options tidak bisa diakses", error);
        }
    };


    const fetchOptions = async () => {
        try {
            const response = await API.get("/type-of-leave", {
                params: {
                    page: 1,
                    sort_by: "created_at desc",
                    limit: 100,
                },
            });

            // console.log("response options :", response.data.payload);
            setLeaveTypes(response.data.payload);
        } catch (error) {
            // console.log("Data options tidak bisa diakses", error);
        }
    };

    const handleOvertime = () => {
        // if (!isOvertime && isOvertimeIn) {
        //     f7.views.main.router.navigate('/overtime/')
        // } else if (isOvertime && absenOut) {
        //     f7.views.main.router.navigate('/capture-face/overtime/')
        // } else if (isOvertime && !absenOut) {
        //     setSheetOpened(true)
        // } else if (!isOvertime && !isOvertimeIn) {
        //     f7.views.main.router.navigate('/capture-face/overtime/')
        // }

        if (!isOvertime && isOvertimeIn) {
            f7.views.main.router.navigate('/overtime/')
        } else {
            f7.views.main.router.navigate('/capture-face/overtime/')
        }
    }

    useEffect(() => {
        if (token) {
            const fetchData = async () => {
                setIsloading(true);
                try {
                    await Promise.all([
                        fetchNews(),
                        fetchNotif(),
                        fetchAbsen(),
                        fetchOvertime(),
                        fetchOptions(),
                        fetchAttendanceData(),
                    ]);
                } catch (error) {
                    console.error("Fetch error:", error);
                } finally {
                    setIsloading(false);
                }
            };

            fetchData();
        }
    }, [token, isRefresh]);

    useEffect(() => {
        const swiperEl = document.querySelector('#mySwiper');

        const onSlideChange = () => {
            const activeIndex = swiperEl.swiper.activeIndex;
            setIsSwiperActive(activeIndex);
        };

        if (swiperEl && swiperEl.swiper) {
            swiperEl.swiper.on('slideChange', onSlideChange);
        }

        return () => {
            if (swiperEl && swiperEl.swiper) {
                swiperEl.swiper.off('slideChange', onSlideChange);
            }
        };
    }, []);

    const tabs = [
        { link: "/attendance/", label: translate('home_attendance', language), coming_soon: false, icon: AttendanceIcon },
        { link: "/permission/", label: translate('home_permission', language), coming_soon: false, icon: PermissionIcon },
        { link: "/payroll/", label: 'Payroll', coming_soon: false, icon: PayrollIcon },
        { link: "/procurement/", label: translate('home_assets', language), coming_soon: false, icon: ProcurementIcon },
    ];

    const tabs2 = [
        { link: "/training/", label: translate('home_training', language), coming_soon: false, icon: DevelopmentIcon },
        { link: "/visit/", label: translate('home_visit', language), coming_soon: false, icon: VisitIcon },
        { link: "/overtime/", label: translate('home_overtime', language), coming_soon: false, icon: OvertimeIcon },
        { link: "/reimburse/", label: 'Reimburse', coming_soon: false, icon: ReimburseIcon },
    ];

    return (
        <Block style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", borderRadius: "40px 40px 0 0", paddingBottom: "20px", marginBottom: 0 }}>
            <div style={{ color: theme === "light" ? "black" : "white" }}>
                <p style={{ fontWeight: "bold", marginBottom: 0, paddingBottom: 0, paddingTop: "25px", fontSize: "var(--font-sm)" }}>{formatDate(today, language, "with-weekdays")}</p>

                <swiper-container
                    space-between="50"
                    id="mySwiper"
                    pagination={false}
                    style={{ height: "225px" }}
                >
                    <swiper-slide>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "130px" }}>
                            <div style={{ textAlign: "center", width: "100%" }}>
                                <p style={{ marginBottom: "-20px", fontSize: "var(--font-sm)" }}>{translate('home_clockin', language)}</p>
                                <p style={{ fontWeight: 700, fontSize: "var(--font-xxl)", marginBottom: "10px" }}>{absenIn ? getHoursMinutes(absenIn) : "--:--"}</p>
                            </div>

                            <div style={{ width: "1px", height: "80px", background: theme == "light" ? "#DFDFDF" : "var(--bg-secondary-gray)" }} />

                            <div style={{ textAlign: "center", width: "100%" }}>
                                <p style={{ marginBottom: "-20px", fontSize: "var(--font-sm)" }}>{translate('home_clockout', language)}</p>
                                <p style={{ fontWeight: 700, fontSize: "var(--font-xxl)", marginBottom: "10px" }}>{absenOut ? getHoursMinutes(absenOut) : "--:--"}</p>
                            </div>
                        </div>

                        <Button
                            className="first-step"
                            onClick={handleAbsen}
                            // disabled
                            style={{
                                height: "50px",
                                background: isAbsenIn ? "var(--bg-primary-green)" : "var(--color-red)",
                                border: "none",
                                borderRadius: "360px",
                                color: "white",
                                textTransform: "capitalize",
                                fontSize: "var(--font-sm)"
                            }}
                        >
                            {isAbsenIn ? translate('home_clockin_button', language) : translate('home_clockout_button', language)}
                        </Button>
                    </swiper-slide>

                    <swiper-slide>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "130px" }}>
                            <div style={{ textAlign: "center", width: "100%" }}>
                                <p style={{ marginBottom: "-20px", fontSize: "var(--font-sm)" }}>{translate('start_overtime', language)}</p>
                                <p style={{ fontWeight: 700, fontSize: "var(--font-xxl)", marginBottom: "10px" }}>{overtimeIn ? getHoursMinutes(overtimeIn) : "--:--"}</p>
                            </div>

                            <div style={{ width: "1px", height: "80px", background: theme == "light" ? "#DFDFDF" : "var(--bg-secondary-gray)" }} />

                            <div style={{ textAlign: "center", width: "100%" }}>
                                <p style={{ marginBottom: "-20px", fontSize: "var(--font-sm)" }}>{translate('end_overtime', language)}</p>
                                <p style={{ fontWeight: 700, fontSize: "var(--font-xxl)", marginBottom: "10px" }}>{overtimeOut ? getHoursMinutes(overtimeOut) : "--:--"}</p>
                            </div>
                        </div>

                        <Button
                            onClick={handleOvertime}
                            // disabled={!isOvertime}
                            // disabled
                            style={{
                                height: "50px",
                                background: isOvertimeIn ? "#F3CD38" : "var(--color-red)",
                                border: "none",
                                borderRadius: "360px",
                                color: isOvertimeIn ? "black" : "white",
                                textTransform: "capitalize",
                                fontSize: "var(--font-sm)"
                            }}
                        >
                            {isOvertimeIn ? translate('start_overtime', language) : translate('end_overtime', language)}
                        </Button>
                    </swiper-slide>
                </swiper-container>

                <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginTop: "-20px", marginBottom: "10px" }}>
                    {[0, 1].map((index) => (
                        <div
                            key={index}
                            style={{
                                width: isSwiperActive === index ? "50px" : "8px",
                                height: "8px",
                                borderRadius: "360px",
                                border: "none",
                                background: isSwiperActive === index ? "var(--bg-primary-green)" : "#F0F0F0",
                                cursor: "pointer",
                                transition: "width 0.3s ease, background 0.3s ease",
                            }}
                        />
                    ))}
                </div>

                <div style={{ marginTop: "35px", marginBottom: "15px", padding: "0 10px" }} className="second-step">
                    <div className="display-flex justify-content-space-between align-items-center">
                        {tabs.map((item) => {
                            const Icons = item.icon

                            return (
                                <Link onClick={() => isLinked(item.link, item.coming_soon)} key={item.label}>
                                    <div style={{ width: "50px", height: "75px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", color: theme === "light" ? "black" : "white" }}>
                                        {item.coming_soon && (
                                            <div style={{ background: "var(--bg-primary-green)", color: "white", position: "absolute", width: "70px", marginTop: "-18px", borderRadius: "4px" }}>
                                                <p style={{ fontSize: "9px", fontWeight: "700", margin: 0, padding: "5px" }}>Coming Soon</p>
                                            </div>
                                        )}

                                        <div style={{ width: "28px", height: "28px", position: "absolute", zIndex: "-1", opacity: theme === "light" ? 1 : 0.1 }} >
                                            <BgIcon fillColor="var(--bg-icon)" width={28} height={28} />
                                        </div>
                                        <div style={{ width: "28px", height: "28px" }}>
                                            <Icons fillColor="var(--bg-primary-green)" width={28} height={28} />
                                        </div>
                                        <p style={{ fontSize: "13px" }}>{item.label}</p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "50px" }}>
                        {tabs2.map((item) => {
                            const Icons = item.icon

                            return (
                                <Link onClick={() => isLinked(item.link, item.coming_soon)} key={item.label}>
                                    <div style={{ width: "50px", height: "75px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", color: theme === "light" ? "black" : "white" }}>
                                        {item.coming_soon && (
                                            <div style={{ background: "var(--bg-primary-green)", color: "white", position: "absolute", width: "70px", marginTop: "-18px", borderRadius: "5px" }}>
                                                <p style={{ fontSize: "9px", fontWeight: "700", margin: 0, padding: "5px" }}>Coming Soon</p>
                                            </div>
                                        )}

                                        <div style={{ width: "28px", height: "28px", position: "absolute", zIndex: "-1", opacity: theme === "light" ? 1 : 0.1 }} >
                                            <BgIcon fillColor="var(--bg-icon)" width={28} height={28} />
                                        </div>
                                        <div style={{ width: "28px", height: "28px" }}>
                                            <Icons fillColor="var(--bg-primary-green)" width={28} height={28} />
                                        </div>
                                        <p style={{ fontSize: "13px" }}>{item.label}</p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {(dataApproval.length > 0 && leaveTypes.length > 0) && (
                    <div style={{ marginTop: "30px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2>{translate('approval_request', language)}</h2>

                            <Link
                                onClick={() => {
                                    f7.views.main.router.navigate('/approval/');
                                }}
                                style={{ color: "var(--bg-primary-green)", fontSize: "var(--font-xs)", fontWeight: "700" }}
                            >
                                {translate('home_see_all', language)}
                            </Link>
                        </div>

                        {dataIdle.length <= 0 && <p style={{ textAlign: "center", fontStyle: "italic", padding: "20px", paddingBottom: "30px" }}>{translate('no_data_approval', language)}</p>}

                        {dataIdle.length > 0 && dataIdle.map((item, index) => {
                            return (
                                <CardIdle key={index} item={item} handleLink={handleLinkRequest} leaveTypes={leaveTypes} />
                            )
                        })}
                    </div>
                )}

                <div>
                    <div className='display-flex flex-direction-row justify-content-space-between align-items-center'>
                        <h2>{translate('home_recent_information', language)}</h2>
                        <Link
                            onClick={() => {
                                dispatch(setActiveTab('view-notif'));
                                dispatch(setActiveTabNotif("tab-1"))
                                f7.views.main.router.navigate('/home/', {
                                    reloadCurrent: false,
                                    clearPreviousHistory: true,
                                    // props: {
                                    //     targetTab: 'view-notif',
                                    //     internalTab: 'tab-1'
                                    // }
                                });
                            }}
                            style={{ color: "var(--bg-primary-green)", fontSize: "var(--font-xs)", fontWeight: "700" }}
                        >
                            {translate('home_see_all', language)}
                        </Link>
                    </div>

                    {
                        (!isloading && dataNews.length == 0) && (
                            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "var(--font-lg)" }}>{translate('no_data', language)}</p>
                        )
                    }

                    {
                        (!isloading && dataNews.length > 0) && (
                            dataNews.map((item, index) => {
                                const latestDate = getLatestDate(item.created_at, item.updated_at);

                                return (
                                    <div onClick={() => handleLink(item.id)} key={index} style={{ borderRadius: "20px", boxShadow: "0 2px 16px 0 rgba(0, 0, 0, 0.15)", padding: "0", margin: "0", marginBottom: "15px", background: theme == "light" ? "transparent" : "var(--bg-secondary-gray)" }}>
                                        <img src={item.thumbnail} alt={item.title} style={{ width: "100%", height: "156px", objectFit: "cover", borderRadius: "20px 20px 0 0" }} />
                                        <div style={{ padding: "15px", marginTop: "-20px" }}>
                                            <p style={{ width: "100%", fontWeight: "bold", marginBottom: 0, fontSize: "var(--font-lg)" }}>{item.title.length > 23 ? item.title.slice(0, 23) + "..." : item.title}</p>
                                            <p style={{ fontWeight: "lighter", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", fontSize: "var(--font-sm)", margin: 0, marginBottom: "10px" }}>
                                                {getRelativeTime(latestDate, language)}
                                            </p>
                                            <p style={{ margin: 0, fontSize: "var(--font-sm)" }}>{getPlainTextDashboard(item.content)}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )
                    }
                </div>
            </div>

            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={translate('havent_clock_out', language)}
                message={translate('havent_clock_out_text', language)}
                imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
            />
        </Block>
    );
}

export default Dashboard;