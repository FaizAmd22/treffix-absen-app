import { f7 } from 'framework7-react';
import { Button, Link, Page } from 'framework7-react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../slices/settingsSlice';
import PerformanceChart from './components/performanceChart';
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import PerformanceUser from './components/performanceUser';
import { API } from '../../api/axios';
import CardPerformance from './components/cardPerformance';
import { selectLanguages } from '../../slices/languagesSlice';
import { translate } from '../../utils/translate';
import { getTranslatedMonths } from '../../functions/getTranslatedMonths';
import Loading from '../../components/loading';
import NoData from '../../components/noData';
import ImageNoData from "../../assets/error/no-data.svg";
import FilterPopup from '../../components/filterPopup';
import { getActivityOptions, getStatusOptions } from '../../utils/selectOptions';


const PerformancePage = () => {
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages)
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentData, setCurrentData] = useState(null);
    const [cardData, setCardData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPoint, setIsLoadingPoint] = useState(false);
    const now = new Date();
    const maxDate = new Date(now.getFullYear(), now.getMonth());
    const minDate = new Date(now.getFullYear(), now.getMonth() - 11);
    const token = localStorage.getItem("token");

    const [isFilterPopup, setIsFilterPopup] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedType, setSelectedType] = useState([]);
    const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
    const [tempSelectedType, setTempSelectedType] = useState([]);

    const months = getTranslatedMonths(language)

    const isSameOrBeforeMonth = (a, b) => {
        return a.getFullYear() < b.getFullYear() || (a.getFullYear() === b.getFullYear() && a.getMonth() <= b.getMonth());
    };

    const isSameOrAfterMonth = (a, b) => {
        return a.getFullYear() > b.getFullYear() || (a.getFullYear() === b.getFullYear() && a.getMonth() >= b.getMonth());
    };

    const isPrevMonthAvailable = () => {
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
        return isSameOrAfterMonth(prevMonth, minDate);
    };

    const isNextMonthAvailable = () => {
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
        return isSameOrBeforeMonth(nextMonth, maxDate);
    };

    const performanceFilterSections = [
        {
            type: 'buttons',
            label: translate('performance_point_activity', language),
            data: getActivityOptions(language),
            selectedValues: tempSelectedType,
            setSelectedValues: setTempSelectedType
        },
        {
            type: 'buttons',
            label: translate('performance_assessment_type', language),
            data: getStatusOptions(language),
            selectedValues: tempSelectedStatus,
            setSelectedValues: setTempSelectedStatus
        }
    ];

    const toggleSelection = (value, selectedArray, setSelectedArray) => {
        if (selectedArray.includes(value)) {
            setSelectedArray(selectedArray.filter(item => item !== value));
        } else {
            setSelectedArray([...selectedArray, value]);
        }
    };

    const closeFilterPopup = () => {
        setIsFilterPopup(false);
    };

    const applyFilter = () => {
        setSelectedStatus([...tempSelectedStatus]);
        setSelectedType([...tempSelectedType]);
        setIsFilterPopup(false);
        fetchPerformanceData();
    };

    const buildCondParams = () => {
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const cond = { "created_at[month]": `${currentDate.getFullYear()}-${month}` };

        if (selectedStatus.includes('plus') && !selectedStatus.includes('minus')) {
            cond["point[gt]"] = "0";
        } else if (selectedStatus.includes('minus') && !selectedStatus.includes('plus')) {
            cond["point[lt]"] = "0";
        }

        if (selectedType.length > 0) {
            cond["type[in]"] = selectedType.join(',');
        }

        return cond;
    };

    const fetchPerformanceData = async () => {
        if (!token) return;
        const cond = buildCondParams();
        setIsLoadingPoint(true)

        try {
            const response = await API.get("/mobile/user-performance", {
                params: {
                    page: 1,
                    cond: JSON.stringify(cond),
                    sort_by: "created_at desc",
                    limit: 100,
                },
            });

            const rawData = response.data.payload;

            const pointAdded = rawData.filter(p => p.point > 0).reduce((sum, item) => sum + item.point, 0);
            const pointReduced = rawData.filter(p => p.point < 0).reduce((sum, item) => sum + Math.abs(item.point), 0);

            const formattedPoints = rawData.map(p => ({
                tanggal: p.created_at,
                point: p.point,
                label: p.name,
                point_activity: p.point > 0 ? "plus" : "minus",
                type: p.type
            }));

            const data = {
                month: currentDate.getMonth(),
                year: currentDate.getFullYear(),
                pointAdded,
                pointReduced,
                points: formattedPoints
            };

            setCurrentData(data);
            setCardData(formattedPoints.slice(0, 3))
        } catch (error) {
            console.log("Data performance tidak bisa diakses", error);
            setCurrentData(null);
        } finally {
            setIsLoadingPoint(false)
        }
    };

    useEffect(() => {
        if (token) {
            setIsLoading(true)
            fetchPerformanceData();
            setIsLoading(false)
        }
    }, [token]);

    useEffect(() => {
        fetchPerformanceData();
    }, [currentDate]);

    const onRefresh = (done) => {
        setIsLoading(true);
        fetchPerformanceData()
        setTimeout(() => {
            setIsLoading(false);
            done();
        }, 500);
    }

    const handlePrevMonth = () => {
        if (isPrevMonthAvailable()) {
            setCurrentDate((prevDate) => {
                const newDate = new Date(prevDate);
                newDate.setMonth(prevDate.getMonth() - 1);
                return newDate;
            });
        }
    };

    const handleNextMonth = () => {
        if (isNextMonthAvailable()) {
            setCurrentDate((prevDate) => {
                const newDate = new Date(prevDate);
                newDate.setMonth(prevDate.getMonth() + 1);
                return newDate;
            });
        }
    };

    const navigateToDetailPage = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        console.log("Navigating to:", `/performance-detail/${month}/${year}/`);
        f7.views.main.router.navigate(`/performance-detail/${month}/${year}/`);
    };

    const hasData = currentData && currentData.points && currentData.points.length > 0;
    console.log("hasData : ", hasData);


    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <div style={{ padding: "15px", color: theme == "light" ? "black" : "white" }}>
                {/*<BackToHomeButton label={translate('home_performance', language)} />*/}

                <PerformanceUser />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", margin: "20px 0" }}>
                    <Button onClick={handlePrevMonth} disabled={!isPrevMonthAvailable()}>
                        <GoChevronLeft size={24} style={{ color: !isPrevMonthAvailable() ? "var(--color-dark-gray)" : "var(--bg-primary-green)", cursor: !isPrevMonthAvailable() ? "not-allowed" : "pointer" }} />
                    </Button>

                    <p style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>{`${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}</p>

                    <Button onClick={handleNextMonth} disabled={!isNextMonthAvailable()}>
                        <GoChevronRight size={24} style={{ color: !isNextMonthAvailable() ? "var(--color-dark-gray)" : "var(--bg-primary-green)", cursor: !isNextMonthAvailable() ? "not-allowed" : "pointer" }} />
                    </Button>
                </div>

                {isLoadingPoint && (
                    <Loading height="30vh" />
                )}

                {(!hasData && !isLoadingPoint) && (
                    <NoData image={ImageNoData} title={translate('no_data_performance', language)} />
                )}

                {(hasData && !isLoadingPoint) && (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "80px", background: theme == "light" ? "#EAF1FE" : "rgba(40, 111, 243, 0.1)", borderRadius: "12px", fontSize: "var(--font-sm)", fontWeight: 400 }}>
                            <div style={{ textAlign: "center", width: "50%" }}>
                                <p style={{ margin: 0, fontSize: "var(--font-sm)" }}>{translate('performance_points_increase', language)}</p>
                                <p style={{ margin: 0, color: "#28A745", fontWeight: 700, fontSize: "var(--font-md)" }}>{`${currentData.pointAdded} Pts`}</p>
                            </div>

                            <div style={{ width: "1px", height: "60%", background: theme == "light" ? "#DFDFDF" : "rgba(40, 111, 243, 0.2)" }} />

                            <div style={{ textAlign: "center", width: "50%" }}>
                                <p style={{ margin: 0, fontSize: "var(--font-sm)" }}>{translate('performance_points_decrease', language)}</p>
                                <p style={{ margin: 0, color: "#DC3545", fontWeight: 700, fontSize: "var(--font-md)" }}>{`${currentData.pointReduced} Pts`}</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", fontWeight: 700 }}>
                            <p style={{ fontSize: "var(--font-md)" }}>{translate('performance_point_activity', language)}</p>
                            <Link onClick={navigateToDetailPage} style={{ fontSize: "var(--font-sm)" }}>{translate('performance_view_all', language)}</Link>
                        </div>
                        <PerformanceChart data={currentData.points} />

                        <div style={{ marginTop: "20px" }}>
                            {
                                cardData.map((item, index) => (
                                    <CardPerformance key={index} item={item} />
                                ))
                            }
                        </div>
                    </>
                )}
            </div>

            <FilterPopup
                isFilterPopup={isFilterPopup}
                closeFilterPopup={closeFilterPopup}
                applyFilter={applyFilter}
                theme={theme}
                language={language}
                popupTitle={translate('performance_select_submission_type', language)}
                filterSections={performanceFilterSections}
                toggleSelection={toggleSelection}
            />
        </Page>
    );
}

export default PerformancePage;