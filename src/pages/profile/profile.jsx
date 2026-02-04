import { useState } from 'react';
import { f7, Link, Page } from 'framework7-react';
import UserProfile from './components/userProfile';
import { MdNavigateNext } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { selectSettings } from '../../slices/settingsSlice';
import { translate } from '../../utils/translate';
import { selectLanguages } from '../../slices/languagesSlice';
import { updateUser } from '../../slices/userSlice';
import { setActiveTab } from '../../slices/tabSlice';
import LoadingPopup from '../../components/loadingPopup';
import CustomPopup from '../../components/customPopup';
import UserDataIcon from '../../icons/userData';
import PersonalDataIcon from '../../icons/personalData';
import EducationDataIcon from '../../icons/educationData';
import EmploymentDataIcon from '../../icons/employmentData';
import PayrollDataIcon from '../../icons/payrollData';
import UpdatePasswordIcon from '../../icons/updatePassword';
import NotificationIcon from '../../icons/notifiaction';
import LogoutIcon from '../../icons/logout';
import LanguageIcon from '../../icons/language';
import ThemeIcon from '../../icons/theme';
import BgIcon from '../../icons/bgIcon';

window.pushNotificationData = window.pushNotificationData || { route: '', params: {} };

const ProfilePage = () => {
    const [popupOpened, setPopupOpened] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const dispatch = useDispatch()

    const profileData = [
        {
            icon: UserDataIcon,
            label: translate('profile_user_data', language),
            link: "/user-data/",
        },
        {
            icon: PersonalDataIcon,
            label: translate('profile_personal_data', language),
            link: "/personal-data/",
        },
        {
            icon: EducationDataIcon,
            label: translate('profile_education_data', language),
            link: "/education-data/",
        },
        {
            icon: EmploymentDataIcon,
            label: translate('profile_employment_data', language),
            link: "/employment-data/",
        },
        {
            icon: PayrollDataIcon,
            label: translate('profile_payroll_data', language),
            link: "/payroll-data/",
        },
    ];

    const settingData = [
        {
            icon: UpdatePasswordIcon,
            label: translate('account_settings_change_password', language),
            link: "/update-password/",
        },
        {
            icon: NotificationIcon,
            label: translate('profile_notification', language),
            link: "/notification-profile/",
        }
    ];

    const preferenceData = [
        {
            icon: LanguageIcon,
            label: translate('profile_language', language),
            link: "/language/",
        },
        {
            icon: ThemeIcon,
            label: translate('profile_display', language),
            link: "/display/",
        }
    ];

    const handleLogoutClick = () => {
        setPopupOpened(true);
    };

    const handleConfirmLogout = async () => {
        setPopupOpened(false);
        setIsLoading(true)
        const token = localStorage.getItem('token');

        // try {
        //     if (token) {
        //         try {
        //             await API.post("/auth/signout", {});
        //             console.log('Berhasil signout dari server');
        //         } catch (signoutError) {
        //             console.error('Gagal signout dari server:', signoutError);
        //         }
        //     }

        //     const isBiometricAvailable = await BiometricAuth.isAvailable();
        //     if (isBiometricAvailable) {
        //         await BiometricAuth.deleteToken();
        //         console.log('Token biometrik berhasil dihapus');
        //     }
        // } catch (error) {
        //     console.error('Gagal menghapus token biometrik:', error);
        // } finally {
        //     dispatch(updateUser({}));
        //     dispatch(setActiveTab('view-home'));
        //     localStorage.removeItem('token');
        //     localStorage.removeItem('isBiometric');
        //     localStorage.removeItem('f7ReminderSystem');

        //     document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";

        //     f7.views.main.router.navigate('/login/', {
        //         reloadCurrent: false,
        //         replaceState: true,
        //         clearPreviousHistory: true,
        //     });
        // }
        setTimeout(() => {
            dispatch(updateUser({}));
            dispatch(setActiveTab('view-home'));
            localStorage.removeItem('token');
            // localStorage.removeItem('isBiometric');
            localStorage.removeItem('f7ReminderSystem');
            localStorage.removeItem('is_registered');
            localStorage.removeItem('HTML5_QRCODE_DATA');
            localStorage.removeItem('dataOcr');

            // if (cordova && cordova.plugins && cordova.plugins.WonderPush) {
            //     console.log('Initializing WonderPush...');
            //     cordova.plugins.WonderPush.unsubscribeFromNotifications();
            // } else {
            //     console.error('WonderPush plugin not available');
            // }

            document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";

            setIsLoading(false)
            f7.views.main.router.navigate('/login/', {
                clearPreviousHistory: true,
            });
        }, 1000);
    };

    const isLinked = (link) => {
        dispatch(setActiveTab('view-profile'))
        f7.views.main.router.navigate(link)
    }

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ marginBottom: "30px", color: theme === "light" ? "black" : "white" }}>
                <UserProfile />

                <div style={{ marginTop: "-15px", padding: "15px 20px", background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", position: "relative", zIndex: 999 }}>
                    <p style={{ fontSize: "var(--font-md)", fontWeight: "700" }}>Profile</p>
                    <div style={{ marginTop: "0px" }}>
                        {
                            profileData.map((item) => {
                                const Icons = item.icon

                                return (
                                    <Link key={item.link} onClick={() => isLinked(item.link)} style={{ display: "flex", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <div style={{ width: "28px", height: "28px", ObjectFit: "cover", position: "absolute", zIndex: "-1", opacity: theme === "light" ? 1 : 0.1 }} >
                                                <BgIcon fillColor="var(--bg-icon)" width={28} height={28} />
                                            </div>
                                            <Icons fillColor="var(--bg-primary-green)" width={28} height={28} />
                                            <p style={{ color: theme === "light" ? "black" : "white", fontSize: "var(--font-sm)" }}>{item.label}</p>
                                        </div>
                                        <MdNavigateNext size={"18px"} color="var(--bg-primary-green)" />
                                    </Link>
                                )
                            })
                        }
                    </div>

                    <p style={{ fontSize: "var(--font-md)", fontWeight: "700" }}>{translate('setting', language)}</p>
                    <div style={{ marginTop: "0px" }}>
                        {
                            settingData.map((item) => {
                                const Icons = item.icon

                                return (
                                    <Link key={item.link} onClick={() => isLinked(item.link)} style={{ display: "flex", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <div style={{ width: "28px", height: "28px", ObjectFit: "cover", position: "absolute", zIndex: "-1", opacity: theme === "light" ? 1 : 0.1 }} >
                                                <BgIcon fillColor="var(--bg-icon)" width={28} height={28} />
                                            </div>
                                            <Icons fillColor="var(--bg-primary-green)" width={28} height={28} />
                                            <p style={{ color: theme === "light" ? "black" : "white", fontSize: "var(--font-sm)" }}>{item.label}</p>
                                            {/*{item.coming_soon && (
                                            <p style={{ color: "var(--color-dark-gray)", fontSize: "var(--font-sm)" }}>(Coming Soon)</p>
                                        )}*/}
                                        </div>
                                        <MdNavigateNext size={"18px"} color="var(--bg-primary-green)" />
                                    </Link>
                                )
                            })
                        }
                    </div>

                    <p style={{ fontSize: "var(--font-md)", fontWeight: "700" }}>{translate('preferences', language)}</p>

                    <div style={{ marginTop: "0px" }}>
                        {
                            preferenceData.map((item) => {
                                const Icons = item.icon

                                return (
                                    <Link key={item.link} onClick={() => isLinked(item.link)} style={{ display: "flex", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <div style={{ width: "28px", height: "28px", ObjectFit: "cover", position: "absolute", zIndex: "-1", opacity: theme === "light" ? 1 : 0.1 }} >
                                                <BgIcon fillColor="var(--bg-icon)" width={28} height={28} />
                                            </div>
                                            <Icons fillColor="var(--bg-primary-green)" width={28} height={28} />
                                            <p style={{ color: theme === "light" ? "black" : "white", fontSize: "var(--font-sm)" }}>{item.label}</p>
                                        </div>
                                        <MdNavigateNext size={"18px"} color="var(--bg-primary-green)" />
                                    </Link>
                                )
                            })
                        }
                    </div>
                </div>

                <Link onClick={handleLogoutClick} style={{ display: "flex", justifyContent: "space-between", padding: "25px 20px 0 20px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <div style={{ width: "28px", height: "28px", ObjectFit: "cover", position: "absolute", zIndex: "-1", opacity: theme === "light" ? 1 : 0.1 }} >
                            <BgIcon fillColor="var(--bg-icon)" width={28} height={28} />
                        </div>
                        <LogoutIcon fillColor="var(--bg-primary-green)" width={28} height={28} />
                        <p style={{ color: theme === "light" ? "black" : "white", fontSize: "var(--font-sm)" }}>{translate('logout', language)}</p>
                    </div>
                    <MdNavigateNext size={"18px"} color="var(--bg-primary-green)" />
                </Link>

                <CustomPopup
                    popupOpened={popupOpened}
                    setPopupOpened={setPopupOpened}
                    title={translate('logout', language)}
                    message={translate('profile_confirm_logout', language)}
                    btnNo={translate('back', language)}
                    handleCancel={() => setPopupOpened(false)}
                    btnYes={translate('profile_confirmed_logout', language)}
                    handleConfirm={handleConfirmLogout}
                />

                <LoadingPopup popupOpened={isLoading} setPopupOpened={setIsLoading} />
            </div>
        </Page>
    );
};

export default ProfilePage;