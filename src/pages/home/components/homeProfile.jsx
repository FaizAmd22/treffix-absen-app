import { Block, f7, } from 'framework7-react';
import { useEffect, useState } from 'react';
import Logo from '../../../assets/logo/logo-blue.svg';
import Logo2 from '../../../assets/logo/logo-white.svg';
import { useDispatch, useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { selectUser } from '../../../slices/userSlice';
import UserPic from "../../../assets/user-pic.jpeg"
import { setActiveTab } from '../../../slices/tabSlice';
import MessageAlert from '../../../components/messageAlert';
import ImageAlertLight from '../../../assets/messageAlert/absen-light.png'
import ImageAlertDark from '../../../assets/messageAlert/absen-dark.png'

const HomeProfile = () => {
    const language = useSelector(selectLanguages)
    const [time, setTime] = useState(translate('morning', language));
    const [popupOpened, setPopupOpened] = useState(false);
    const [sheetOpened, setSheetOpened] = useState(false);
    const user = useSelector(selectUser)
    const theme = useSelector(selectSettings)
    const dispatch = useDispatch()

    const openPopup = () => setPopupOpened(true);
    const closePopup = () => setPopupOpened(false);

    const getCurrentTime = () => {
        const currentHour = new Date().getHours();

        if (currentHour >= 5 && currentHour < 11) {
            setTime(translate('morning', language));
        } else if (currentHour >= 11 && currentHour < 15) {
            setTime(translate('afternoon', language));
        } else if (currentHour >= 15 && currentHour < 18) {
            setTime(translate('evening', language));
        } else {
            setTime(translate('night', language));
        }
    };

    useEffect(() => {
        getCurrentTime();
    }, [language]);


    return (
        <>
            <Block style={{ margin: 0, paddingTop: 0, height: "20vh", color: 'white', display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "-20px" }}>
                    <img src={theme === "light" ? Logo : Logo2} alt="Logo" style={{ width: "40px", height: "40px", objectFit: "cover" }} />

                    <Block style={{ marginRight: 0, paddingRight: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                        {user.contract_will_expired && (
                            <p style={{ background: "var(--color-bg-tr-yellow)", color: "var(--color-yellow)", margin: 0, padding: "4px 12px", borderRadius: "50px", fontWeight: 700 }}>{translate('contract_expired', language)}</p>
                        )}

                        <div
                            style={{ display: "flex", background: "none", border: "none" }}
                            onClick={() => {
                                dispatch(setActiveTab('view-profile'))
                                f7.views.main.router.navigate('/home/', {
                                    props: {
                                        targetTab: 'view-profile',
                                    }
                                })
                            }}
                        >
                            <img src={user.profile_pic ? user.profile_pic : UserPic} alt="Profile Image" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "100%" }} />

                            {/*<div style={{ width: "12px", height: "12px", background: "var(--color-green)", borderRadius: "100%", marginTop: "27px", marginLeft: "-12px" }} />*/}
                        </div>
                    </Block>
                </div>

                <p style={{ fontWeight: "lighter", marginTop: "3px", marginBottom: "1px", fontSize: "var(--font-sm)" }}>{translate('good', language)} {time},</p>
                <p onClick={() => setSheetOpened(true)} style={{ fontWeight: "bold", marginTop: "0px", fontSize: "30px" }}>{user.name ? user.name : "Loading..."}</p>
            </Block>

            {/*<Popup
                opened={popupOpened}
                onPopupClose={closePopup}
                style={{ marginTop: "380px", borderRadius: "12px 12px 0 0", background: "var(--bg-primary-white)" }}
            >
                <Block style={{ padding: "0px 0px", margin: "15px 0", background: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 25px" }}>
                        <p style={{ fontWeight: "bold", fontSize: "var(--font-sm)" }}>Status</p>
                        <Button style={{ width: "30px", border: "none", background: "none" }} onClick={closePopup}>
                            <IoClose size={"20px"} />
                        </Button>
                    </div>

                    <List menuList style={{ marginTop: "10px" }} >
                        <ListItem
                            link
                            title="Online"
                        />
                        <ListItem
                            link
                            title="Cuti"
                        />
                        <ListItem
                            link
                            title="Meeting"
                        />
                        <ListItem
                            link
                            title="Dinas Di Luar"
                        />
                    </List>
                </Block>
            </Popup>*/}

            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={translate('submission_success', language)}
                message={translate('submission_reimburse_success_text', language)}
                imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
            />
        </>
    );
}

export default HomeProfile;