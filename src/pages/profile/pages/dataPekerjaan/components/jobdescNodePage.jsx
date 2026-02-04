import { Button, Link, Page, Tab, Tabs, Toolbar } from 'framework7-react';
import React, { useEffect, useState } from 'react';
import { API } from '../../../../../api/axios';
import Loading from '../../../../../components/loading';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../../../slices/settingsSlice';
import BackButton from '../../../../../components/backButton';
import { selectLanguages } from '../../../../../slices/languagesSlice';
import { translate } from '../../../../../utils/translate';
import userProfile from '../../../../../assets/user-pic.jpeg'
import ImageNoData from "../../../../../assets/error/no-data.svg";
import NoData from '../../../../../components/noData';

const JobdescNodePage = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [dataIncumbent, setDataIncumbent] = useState([])
    const [dataJobdesc, setDataJobdesc] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("tab-1");
    const selectedNode = JSON.parse(localStorage.getItem('selected_node'))

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const incumbent = await API.get(`/job-position/users/${selectedNode.id}`);
            const jobdesc = await API.get(`/job-positions/${selectedNode.id}/qualifications`);

            setDataIncumbent(incumbent.data.payload)
            setDataJobdesc(jobdesc.data.payload)
        } catch (error) {
            console.log("Data chart tidak bisa diakses!", error);
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (selectedNode) {
            fetchData()
        }
    }, [])

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };


    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "15px", marginBottom: "15px", fontSize: "var(--font-sm)", color: theme === "light" ? "black" : "white" }}>
                <BackButton label={selectedNode?.position} />

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
                            border: (activeTab === "tab-1" && theme === "light") ? "1px solid white" : (activeTab === "tab-1" && theme !== "light") ? "1px solid var(--bg-primary-green)" : "none",
                            padding: "0px 15px",
                            textTransform: "capitalize",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            fontWeight: 700,
                            background: (activeTab === "tab-1" && theme === "light") ? "white" : (activeTab === "tab-1" && theme !== "light") ? "var(--bg-primary-green-transparent)" : "transparent",
                            color: activeTab === "tab-1" ? "var(--bg-primary-green)" : (theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)")
                        }}
                    >
                        {translate('incumbent', language)}
                    </Button>

                    <Button
                        onClick={() => handleTabChange("tab-2")}
                        style={{
                            flex: 1,
                            border: (activeTab === "tab-2" && theme === "light") ? "1px solid white" : (activeTab === "tab-2" && theme !== "light") ? "1px solid var(--bg-primary-green)" : "none",
                            padding: "0px 15px",
                            textTransform: "capitalize",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            fontWeight: 700,
                            background: (activeTab === "tab-2" && theme === "light") ? "white" : (activeTab === "tab-2" && theme !== "light") ? "var(--bg-primary-green-transparent)" : "transparent",
                            color: activeTab === "tab-2" ? "var(--bg-primary-green)" : (theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)")
                        }}
                    >
                        {translate('desc_and_qualification', language)}
                    </Button>
                </div>

                {isLoading ? (
                    <Loading height={"60vh"} />
                ) : (
                    <div style={{ marginTop: "10px" }}>
                        <div
                            style={{
                                display: activeTab === "tab-1" ? "block" : "none",
                                width: "95%",
                                marginRight: "25px"
                            }}
                        >
                            {(dataIncumbent && dataIncumbent.length > 0) ? (
                                <div style={{ width: "100%", marginTop: "20px" }}>
                                    {dataIncumbent.map((item, index) => (
                                        <div key={index} style={{
                                            width: "95%",
                                            borderRadius: "10px",
                                            boxShadow: "0 2px 16px 0 rgba(0,0,0,0.1)",
                                            display: "flex",
                                            gap: "10px",
                                            alignItems: "center",
                                            marginBottom: "18px",
                                            padding: "10px 0",
                                            paddingLeft: "12px",
                                            marginLeft: "10px"
                                        }}>
                                            <img
                                                src={item.user_photo ? item.user_photo : userProfile}
                                                alt="Profile Image"
                                                style={{
                                                    width: "50px",
                                                    height: "50px",
                                                    objectFit: "cover",
                                                    borderRadius: "100%"
                                                }}
                                            />
                                            <p style={{ fontWeight: 700, fontSize: "var(--font-md)" }}>
                                                {item?.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <NoData image={ImageNoData} title={translate('no_incumbent', language)} />
                            )}
                        </div>

                        <div
                            style={{
                                display: activeTab === "tab-2" ? "block" : "none",
                                width: "95%"
                            }}
                        >
                            {dataJobdesc ? (
                                <div style={{ fontSize: "var(--font-md)", marginTop: "20px" }}>
                                    <p style={{ fontWeight: 700, margin: 0 }}>
                                        {translate('job_description', language)}
                                    </p>
                                    <p>{dataJobdesc.job_description ?? "-"}</p>

                                    <p style={{ fontWeight: 700, margin: 0, paddingTop: "15px" }}>
                                        {translate('qualification', language)}
                                    </p>
                                    <p>{dataJobdesc.job_requirement ?? "-"}</p>
                                </div>
                            ) : (
                                <NoData image={ImageNoData} title={translate('no_desc_and_qualification', language)} />
                            )}
                        </div>
                    </div>
                )}
            </div >
        </Page >
    );
};

export default JobdescNodePage;