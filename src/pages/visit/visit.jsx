import { Button, Link, Page, f7 } from 'framework7-react'
import React, { useState } from 'react'
import { selectSettings } from '../../slices/settingsSlice';
import { useSelector } from 'react-redux';
import { selectVisitIn, selectVisitOut } from '../../slices/visitSlice';
import { formatDate } from '../../functions/formatDate';
import { selectLanguages } from '../../slices/languagesSlice';
import { getHoursMinutes } from '../../functions/getHoursMinutes';
import { translate } from '../../utils/translate';
import BackButton from '../../components/backButton';

const VisitPage = () => {
    const today = new Date()
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const visitIn = useSelector(selectVisitIn)
    const visitOut = useSelector(selectVisitOut)
    const [data, setData] = useState([0, 1, 2])

    const handleLink = (id) => {
        f7.views.main.router.navigate(`/visit-detail/${id}/`)
    }

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "15px", marginBottom: "70px", color: theme === "light" ? "black" : "white" }}>
                <BackButton label={translate('home_visit', language)} />

                {/*<p style={{ fontWeight: "bold", marginBottom: "0px", paddingBottom: "0px", paddingTop: "5px", fontSize: "var(--font-sm)", }}>{formatDate(today, language, "with-weekdays")}</p>

                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: "130px", padding: "0 20px", fontSize: "var(--font-sm)", marginTop: "20px" }}>
                    <div style={{ textAlign: "center" }}>
                        <p>{translate('visit_in', language)}</p>
                        <p style={{ fontWeight: "bolder", fontSize: "var(--font-xxl)" }}>{visitIn ? getHoursMinutes(visitIn) : "--:--"}</p>
                    </div>

                    <div style={{ width: "1px", height: "80px", background: theme == "light" ? "#DFDFDF" : "var(--bg-secondary-gray)" }} />

                    <div style={{ textAlign: "center" }}>
                        <p>{translate('visit_out', language)}</p>
                        <p style={{ fontWeight: "bolder", fontSize: "var(--font-xxl)" }}>{visitOut ? getHoursMinutes(visitOut) : "--:--"}</p>
                    </div>
                </div>*/}

                <p style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>{translate('visit_history', language)}</p>

                {
                    data.map((item, index) => (
                        <div onClick={() => handleLink(index)} key={index} style={{ border: theme == "light" ? "1px solid var(--border-primary-gray)" : "1px solid #1E1E1E", borderRadius: "12px", fontSize: "var(--font-sm)", marginBottom: "20px", background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)" }}>
                            <div style={{ borderBottom: theme == "light" ? "1px solid var(--border-primary-gray)" : "1px solid #1E1E1E", padding: "5px 15px" }}>
                                <p style={{ fontWeight: 700 }}>Alfa Tower</p>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "40% 60%", fontWeight: 400, padding: "10px 15px" }}>
                                <p style={{ margin: "4px 0" }}>Date</p>
                                <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>{formatDate(today, language, "with-weekdays")}</p>

                                <p style={{ margin: "4px 0" }}>{translate('visit_in', language)}</p>
                                <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>12:56</p>

                                <p style={{ margin: "4px 0" }}>{translate('visit_out', language)}</p>
                                <p style={{ fontWeight: 700, textAlign: "end", margin: "4px 0" }}>17:19</p>
                            </div>
                        </div>
                    ))
                }
            </div>

            <div style={{ width: "100%", height: "80px", borderTop: theme == "light" ? "1px solid var(--border-primary-gray)" : "1px solid #363636", background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", position: "fixed", bottom: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Button type="link" disabled={visitIn != null && visitOut != null} href="/visit-submission/" style={{ width: "90%", backgroundColor: visitIn == null ? "var(--bg-primary-green)" : visitOut == null ? "var(--color-red)" : "var(--color-dark-gray)", color: "white", fontSize: "var(--font-sm)", fontWeight: "700", padding: "25px 0px", textTransform: "capitalize", borderRadius: "8px", marginBottom: "10px" }}>
                    <p>{visitIn == null ? translate('visit_in', language) : visitOut == null ? translate('visit_out', language) : translate('home_rest_button', language)}</p>
                </Button>
            </div>
        </Page>
    );
}

export default VisitPage