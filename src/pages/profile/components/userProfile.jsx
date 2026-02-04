import React from 'react'
import { Button, f7 } from 'framework7-react';
import UserPic from "../../../assets/user-pic.jpeg"
import { GoDotFill } from "react-icons/go";
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../../slices/userSlice';
import { selectSettings } from '../../../slices/settingsSlice';
import TextureBg from "../../../assets/bg-texture.svg"
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { setActiveTab } from '../../../slices/tabSlice';

const UserProfile = () => {
    const user = useSelector(selectUser)
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const dispatch = useDispatch()

    console.log("data user :", user);

    const handleLink = () => {
        dispatch(setActiveTab('view-performance'))
        f7.views.main.router.navigate('/home/', {
            reloadCurrent: false,
            replaceState: true,
            clearPreviousHistory: true,
            props: {
                targetTab: 'view-performance'
            }
        })
    }


    return (
        <div style={{ background: theme === "light" ? "var(--bg-primary-black)" : "linear-gradient(#33a59d, #0f7a84)", color: "white", paddingBottom: "40px" }}>
            <img src={TextureBg} alt="TextureBg" style={{ width: "100%", height: "320px", objectFit: "cover", position: "fixed", opacity: "20%" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "20px", gap: "8px", paddingTop: "30px" }}>
                <img src={user.profile_pic ? user.profile_pic : UserPic} alt="ProfileImage" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%", position: "relative", zIndex: 99 }} />

                <p style={{ margin: 0, marginTop: "8px", fontSize: "var(--font-xl)", fontWeight: "bold" }}>{user.name ? user.name : "Loading..."}</p>
                <p style={{ margin: 0, fontSize: "var(--font-sm)" }}>{user.job_position_name ? user.job_position_name : ""}</p>
                {user.contract_will_expired && (
                    <p style={{ background: "var(--color-bg-tr-yellow)", color: "var(--color-yellow)", margin: 0, padding: "4px 20px", borderRadius: "50px", fontWeight: 700 }}>{translate('contract_expired', language)}</p>
                )}

                {/*<div style={{ display: "flex", alignItems: 'center', marginTop: "-8px" }}>
                        <GoDotFill style={{ color: "var(--color-green)" }} size={"15px"} />
                        <p>Online</p>
                    </div>*/}
            </div>

            <Button
                onClick={handleLink}
                style={{
                    width: "90%",
                    height: "56px",
                    background: theme === "light" ? "var(--bg-primary-green)" : "var(--bg-primary-black)",
                    color: theme === "light" ? "white" : "var(--bg-primary-green)",
                    fontSize: "var(--font-sm)",
                    fontWeight: "700",
                    padding: "20px 0px",
                    textTransform: "capitalize",
                    borderRadius: "8px",
                    margin: "auto",
                    marginTop: 0
                }}
            >
                <p>{translate('profile_look_performance', language)}</p>
            </Button>
        </div>
    )
}

export default UserProfile