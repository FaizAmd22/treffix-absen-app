import { Button, Link, Page, f7 } from 'framework7-react'
import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { API } from '../../../api/axios'
import { formatDate } from '../../../functions/formatDate'
import { selectLanguages } from '../../../slices/languagesSlice'
import { pushNotification } from '../../../functions/pushNotification'
import { translate } from '../../../utils/translate'
import { setActiveTab } from '../../../slices/tabSlice'
import Loading from '../../../components/loading'
import { showToastFailed } from '../../../functions/toast'

const NewsDetail = () => {
    const [dataNews, setDataNews] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const token = localStorage.getItem("token")
    const dispatch = useDispatch()
    const currentRoute = f7.views.main.router.currentRoute;
    console.log("current route", currentRoute.url);

    const fetchNewsDetail = async () => {
        const { id } = f7.views.main.router.currentRoute.params;
        setIsLoading(true)
        try {
            const response = await API.get(`/news/${id}`);

            const payload = response.data.payload;
            console.log("Response Payload:", payload);
            setDataNews(payload)
        } catch (error) {
            console.error("Error in fetchNewsDetail:", error);
            // f7.dialog.alert(translate('training_detail_failed_getdetail', language), () => { f7.views.main.router.back() })
            f7.views.main.router.back()
            showToastFailed(translate('training_detail_failed_getdetail', language))
        } finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        if (token) {
            fetchNewsDetail()
        }
    }, [token])

    const handleLink = () => {
        const { backto } = f7.views.main.router.currentRoute.params;
        console.log("backto :", backto);
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
                    internalTab: 'tab-1'
                }
            });
        }
    }


    if (isLoading) {
        return (
            <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
                <div style={{ position: "relative", height: "36vh", color: theme == "light" ? "black" : "white" }}>
                    <Link
                        back
                        style={{ color: "white", position: "absolute", top: 25, left: 10, background: "rgba(0,0,0, 0.3)", borderRadius: "100%", padding: "5px", textAlign: "center" }}
                    >
                        <IoIosArrowRoundBack size={"25px"} />
                    </Link>

                    <Loading height="80vh" />
                </div>
            </Page>
        )
    }

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ position: "relative", height: "36vh", color: theme == "light" ? "black" : "white" }}>
                <Link
                    back
                    style={{ color: "white", position: "absolute", top: 25, left: 10, background: "rgba(0,0,0, 0.3)", borderRadius: "100%", padding: "5px", textAlign: "center" }}
                >
                    <IoIosArrowRoundBack size={"25px"} />
                </Link>

                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <img
                        src={dataNews.thumbnail}
                        alt="Content"
                        style={{
                            width: "100%",
                            height: "98%",
                            objectFit: "cover",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            width: "100%",
                            height: "30%",
                            background:
                                theme === "light"
                                    ? "linear-gradient(to top, var(--bg-primary-white), rgba(0,0,0,0))"
                                    : "linear-gradient(to top, #1A1A1A, rgba(0,0,0,0))",
                        }}
                    ></div>
                </div>

                <div style={{ padding: "0 18px" }}>
                    <p style={{ fontSize: "var(--font-lg)", fontWeight: 700, marginBottom: 0 }}>{dataNews.title}</p>
                    <p style={{ fontSize: "var(--font-sm)", fontWeight: 400, color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", marginTop: "3px" }}>{formatDate(dataNews.updated_at, language, "with-weekdays")}</p>
                    <div
                        dangerouslySetInnerHTML={{ __html: dataNews.content }}
                        style={{ marginTop: "20px" }}
                    />
                </div>
            </div>
        </Page>
    )
}

export default NewsDetail