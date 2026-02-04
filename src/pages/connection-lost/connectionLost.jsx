import { Block, Button, f7, Page } from 'framework7-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../slices/settingsSlice'
import ImageCL from '../../assets/error/connection-error.svg'
import { translate } from '../../utils/translate'
import { selectLanguages } from '../../slices/languagesSlice'
import LoadingPopup from '../../components/loadingPopup'
import CustomButton from '../../components/customButton'

const ConnectionLost = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [showLoading, setShowLoading] = useState(false);

    const handleReload = () => {
        const previousUrl = localStorage.getItem('previousRoute');
        if (!navigator.onLine) {
            setShowLoading(true)

            setTimeout(() => {
                setShowLoading(false)
                return
            }, 100);
        } else {
            if (previousUrl) {
                localStorage.removeItem('previousRoute');
                f7.views.main.router.navigate(previousUrl, {
                    reloadCurrent: true,
                    ignoreCache: true,
                });
            } else {
                f7.views.main.router.navigate('/', {
                    reloadCurrent: true,
                    ignoreCache: true,
                });
            }
        }

    };

    return (
        <Page
            style={{
                height: "100vh",
                background:
                    theme === "light"
                        ? "var(--bg-primary-white)"
                        : "var(--bg-secondary-black)",
            }}
        >
            <div style={{ padding: "0 20px", color: theme == "light" ? "black" : "white" }}>
                <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                    <img src={ImageCL} style={{ width: "80%", objectFit: "cover" }} />

                    <p style={{ fontSize: "var(--font-lg)", fontWeight: 700 }}>{translate('connection_error', language)}</p>
                    <p style={{ fontSize: "var(--font-sm)", marginTop: 0 }}>{translate('connection_error_text', language)}</p>

                    <CustomButton
                        color={"white"}
                        bg={"var(--bg-primary-green)"}
                        text={translate('reload', language)}
                        handleClick={handleReload}
                    />
                </div>
            </div>

            <LoadingPopup popupOpened={showLoading} setPopupOpened={setShowLoading} />
        </Page>
    )
}

export default ConnectionLost