import React, { useEffect, useRef, useState } from 'react';
import { Page, Toolbar, Tabs, Tab, Link, f7 } from 'framework7-react';
import HomePage from '../pages/home/home';
import ProfilePage from '../pages/profile/profile';
import SchedulePage from '../pages/schedule/schedule';
import { useDispatch, useSelector } from 'react-redux';
import { selectSettings } from '../slices/settingsSlice';
import { selectLanguages } from '../slices/languagesSlice';
import { translate } from '../utils/translate';
import NotificationsPage from '../pages/notifications/notifications';
import { selectActiveTab, setActiveTab } from '../slices/tabSlice';
import { API } from '../api/axios';
import PerformancePage from '../pages/performance/performance';
import { selectCountNotif } from '../slices/countNotifSlice';
import { setActiveTabNotif } from '../slices/tabNotifSlice';
import HomeNavbarIcon from '../icons/homeNavbar';
import HomeNavbarActiveIcon from '../icons/homeNavbarActive';
import ScheduleNavbarIcon from '../icons/scheduleNavbar';
import ScheduleNavbarActiveIcon from '../icons/scheduleNavbarActive';
import PerformanceNavbarIcon from '../icons/performanceNavbar';
import PerformanceNavbarActiveIcon from '../icons/performanceNavbarActive';
import NotificationNavbarIcon from '../icons/notificationNavbar';
import NotificationNavbarActiveIcon from '../icons/notificationNavbarActive';
import ProfileNavbarIcon from '../icons/profileNavbar';
import ProfileNavbarActiveIcon from '../icons/profileNavbarActive';

const Layout = () => {
    const dispatch = useDispatch();
    const activeTab = useSelector(selectActiveTab);
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const token = localStorage.getItem("token")
    const countNotifs = useSelector(selectCountNotif)
    const [countNotif, setCountNotif] = useState(null)

    const pageRef = useRef(null);

    const tabs = [
        { id: 'view-home', label: translate('home', language), icon: HomeNavbarIcon, iconFill: HomeNavbarActiveIcon },
        { id: 'view-jadwal', label: translate('schedule', language), icon: ScheduleNavbarIcon, iconFill: ScheduleNavbarActiveIcon },
        { id: 'view-performance', label: translate('home_performance', language), icon: PerformanceNavbarIcon, iconFill: PerformanceNavbarActiveIcon },
        { id: 'view-notif', label: translate('notif', language), icon: NotificationNavbarIcon, iconFill: NotificationNavbarActiveIcon },
        { id: 'view-profile', label: translate('profile', language), icon: ProfileNavbarIcon, iconFill: ProfileNavbarActiveIcon },
    ];

    const fetchNotif = async () => {
        try {
            const response = await API.get("/notification", {
                params: {
                    limit: 100,
                    sort_by: "created_at desc"
                }
            });
            const data = response.data.payload;
            const news = data.filter(item => item.type == "news")
            const request = data.filter(item => item.type == "request" && (item.device == "mobile" || item.device == "all") && item.attachments.data.status !== "idle")
            const request_approve = data.filter(item => item.type == "request_approve" && (item.device == "mobile" || item.device == "all"))
            const unreadNews = news.filter(item => item.is_read == false)
            const unreadReq = request.filter(item => item.is_read == false)
            const unreadReqApprove = request_approve.filter(item => item.is_read == false);

            const notifNumbers = unreadReqApprove.map(item => ({
                idContent: item.attachments.data.id,
                idNotif: item.id
            }));

            localStorage.setItem('notificationData', JSON.stringify(notifNumbers));

            if (data) {
                setCountNotif(unreadNews.length + unreadReq.length + unreadReqApprove.length)
            }
        } catch (error) {
            console.log("Data news tidak bisa diakses", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotif()
        }
    }, [token])

    const scrollToTop = (tabId) => {
        const scrollMethods = [50, 100, 200, 500];

        scrollMethods.forEach(delay => {
            setTimeout(() => {
                try {
                    const activeTabPage = document.querySelector(`#${tabId}.tab-active .page-content`);
                    if (activeTabPage) {
                        activeTabPage.scrollTop = 0;
                        return;
                    }

                    const tabPage = document.querySelector(`#${tabId} .page-content`);
                    if (tabPage) {
                        tabPage.scrollTop = 0;
                        return;
                    }

                    const allPageContents = document.querySelectorAll('.page-content');
                    allPageContents.forEach(content => {
                        if (content.offsetParent !== null) {
                            content.scrollTop = 0;
                        }
                    });

                    const tabContainer = document.querySelector(`#${tabId}`);
                    if (tabContainer) {
                        tabContainer.scrollTop = 0;
                    }
                } catch (error) {
                    console.log(`Scroll attempt ${delay}ms failed:`, error);
                }
            }, delay);
        });
    };

    const handleTabChange = (tabId) => {
        dispatch(setActiveTab(tabId));
        if (tabId == "view-notif") dispatch(setActiveTabNotif("tab-1"))
        f7.tab.show(`#${tabId}`);

        scrollToTop(tabId);
    };

    useEffect(() => {
        if (activeTab) {
            scrollToTop(activeTab);
        }
    }, [activeTab]);

    const onRefresh = (done) => {
        fetchNotif()
        setTimeout(() => {
            done();
        }, 500);
    }

    return (
        <Page ref={pageRef} pageContent={false} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <Toolbar
                tabbar
                icons
                position="bottom"
                style={{
                    height: '11vh',
                    background: theme === 'light' ? 'var(--bg-primary-white)' : 'var(--bg-secondary-black)',
                    borderTop: theme === 'light' ? '2px solid var(--border-primary-gray)' : '2px solid #1E1E1E'
                }}
            >
                {tabs.map((tab, index) => {
                    const Icons = tab.icon
                    const ActiveIcons = tab.iconFill

                    return (
                        <Link
                            className={index == 1 ? 'third-step' : index == 3 ? 'fourth-step' : ""}
                            key={tab.id}
                            tabLink={`#${tab.id}`}
                            tabLinkActive={activeTab === tab.id}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            {(tab.id == "view-notif" && countNotifs > 0) && (
                                <p style={{ margin: 0, fontSize: "12px", background: "var(--color-red)", borderRadius: "100%", width: "11px", height: "11px", color: "white", position: "absolute", top: "20%", right: "32%", zIndex: 99 }}></p>
                            )}

                            <div style={{ width: "25px", height: "25px", paddingTop: "8px" }}>
                                {activeTab === tab.id ? <ActiveIcons fillColor="var(--bg-primary-green)" width={28} height={28} /> : <Icons fillColor={"#B8B8B8"} width={28} height={28} />}
                            </div>
                            <p style={{ fontSize: '12px', marginTop: '6px', color: activeTab !== tab.id ? "var(--color-dark-gray)" : "var(--bg-primary-green)" }}>
                                {tab.label}
                            </p>
                        </Link>
                    )
                })}
            </Toolbar>

            <Tabs>
                <Tab id="view-home" tabActive={activeTab === 'view-home'}>
                    <HomePage />
                </Tab>
                <Tab id="view-notif" tabActive={activeTab === 'view-notif'}>
                    <NotificationsPage />
                </Tab>
                <Tab id="view-performance" tabActive={activeTab === 'view-performance'}>
                    <PerformancePage />
                </Tab>
                <Tab id="view-jadwal" tabActive={activeTab === 'view-jadwal'}>
                    <SchedulePage />
                </Tab>
                <Tab id="view-profile" tabActive={activeTab === 'view-profile'}>
                    <ProfilePage />
                </Tab>
            </Tabs>
        </Page>
    );
};

export default Layout;