import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Block, Button, Page } from 'framework7-react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../slices/settingsSlice';
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import CardAttendance from './components/cardAttendance';
import { selectLanguages } from '../../slices/languagesSlice';
import { translate } from '../../utils/translate';
import { API } from '../../api/axios';
import { getTranslatedMonths } from '../../functions/getTranslatedMonths';
import Loading from '../../components/loading';
import BackButton from '../../components/backButton';
import LoadingMoreAnimation from '../../components/loadingMoreAnimation';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export const generateMonths = (language) => {
    const translatedMonths = getTranslatedMonths(language);
    const result = [];

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    for (let i = 11; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);

        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        result.push({
            label: `${translatedMonths[monthIndex]} ${year}`,
            dateKey: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
        });
    }

    return result;
};

const AttendancePage = () => {
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const token = localStorage.getItem("token");

    const months = generateMonths(language);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(months.length - 1);
    const [activeIndex, setActiveIndex] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [cardData, setCardData] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [scrollDebounceTimer, setScrollDebounceTimer] = useState(null);

    const observer = useRef();
    const listRef = useRef();
    const ITEMS_PER_PAGE = 10;

    const currentMonth = months[currentMonthIndex];

    const categories = [
        { label: translate('ontime', language), key: "ontime", color: "#737AFC" },
        { label: translate('overtime', language), key: "overtime", color: "#73D3FC" },
        { label: "Unpaid Leave", key: "unpaid", color: "#FC9595" },
        { label: translate('late', language), key: "late", color: "#F9ED93" },
        { label: translate('attendance_permission', language), key: "leave", color: "#90F39F" }
    ];

    const mappedData = categories.map(cat => {
        const found = chartData.find(d => d.name === cat.key);
        return {
            label: cat.label,
            jumlah: found?.value || 0,
            color: cat.color
        };
    });

    const doughnutData = {
        labels: mappedData.map(item => item.label),
        datasets: [{
            label: translate('home_attendance', language),
            data: mappedData.map(item => item.jumlah),
            backgroundColor: mappedData.map(item => item.color),
            borderWidth: mappedData.map((_, i) => activeIndex === i ? 8 : 0),
            borderColor: mappedData.map((item, i) => activeIndex === i ? item.color : 'transparent'),
        }]
    };

    const options = {
        responsive: true,
        cutout: '60%',
        plugins: {
            legend: { display: false },
            datalabels: {
                formatter: (value, context) => {
                    if (value < 1) return "";
                    const total = context.chart.data.datasets[0].data.reduce((acc, val) => acc + val, 0);
                    return ((value / total) * 100).toFixed(2) + '%';
                },
                color: 'black',
            },
            tooltip: { enabled: false }
        },
        onClick: (event, chartElement) => {
            const clickedIndex = chartElement[0]?.index;
            if (clickedIndex !== undefined) {
                setActiveIndex(clickedIndex);
            }
        }
    };

    const lastElementRef = useCallback(node => {
        if (loadingMore || allDataLoaded) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore && !allDataLoaded) {
                console.log("Last element is visible, scheduling data load after delay...");

                if (scrollDebounceTimer) {
                    clearTimeout(scrollDebounceTimer);
                }

                setLoadingMore(true);
                const timer = setTimeout(() => {
                    if (page < totalPages) {
                        const nextPage = page + 1;
                        setPage(nextPage);
                        fetchAttendanceCard(nextPage, false);
                    } else {
                        console.log("All pages loaded. No more data to fetch.");
                        setAllDataLoaded(true);
                        setLoadingMore(false);
                    }
                }, 700);

                setScrollDebounceTimer(timer);
            }
        }, { threshold: 0.1 });

        if (node) observer.current.observe(node);
    }, [hasMore, loadingMore, page, totalPages, allDataLoaded, scrollDebounceTimer]);

    useEffect(() => {
        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
            if (scrollDebounceTimer) {
                clearTimeout(scrollDebounceTimer);
            }
        };
    }, [scrollDebounceTimer]);

    const fetchAttendanceAnalytic = async () => {
        try {
            const response = await API.get(`/mobile/attendances/user-analytics?cond={"attendance_at[month]":"${currentMonth.dateKey}"}`);
            const data = response.data.payload;
            setChartData(data || []);
            console.log("data fetch analytic :", data);
        } catch (err) {
            console.error("Failed to fetch analytic data", err);
            setChartData([]);
        }
    };

    const fetchAttendanceCard = async (pageNumber = 1, isNewRequest = false) => {
        try {
            if (isNewRequest) {
                setLoadingMore(false);
                setAllDataLoaded(false);
                setPage(1);
                setHasMore(true);
            }

            console.log(`Fetching attendance card data for page ${pageNumber}...`);

            const response = await API.get(`/mobile/attendances/user`, {
                params: {
                    limit: ITEMS_PER_PAGE,
                    cond: JSON.stringify({ "attendance_at[month]": currentMonth.dateKey }),
                    sort_by: "attendance_at desc",
                    page: pageNumber
                }
            });

            console.log("Full API response:", response.data);

            const responseData = response.data.payload || [];
            const pagination = response.data.pagination;

            const filteredData = responseData.filter(item => item.status !== "offin");

            if (pagination) {
                setTotalPages(pagination.total_page);
                console.log(`Total pages: ${pagination.total_page}, Current page: ${pageNumber}`);

                if (pageNumber >= pagination.total_page) {
                    setHasMore(false);
                    setAllDataLoaded(true);
                    console.log("Reached last page, no more data to load");
                }
            }

            if (filteredData.length === 0) {
                console.log("No data received");
                if (pageNumber === 1) {
                    setCardData([]);
                }
                setHasMore(false);
                setAllDataLoaded(true);
            } else {
                console.log(`Received ${filteredData.length} items for page ${pageNumber}`);

                if (isNewRequest) {
                    setCardData(filteredData);
                } else {
                    setCardData(prevData => {
                        const existingDataMap = new Map();
                        prevData.forEach(item => {
                            existingDataMap.set(item.id, item);
                        });

                        const newUniqueData = filteredData.filter(item => !existingDataMap.has(item.id));

                        console.log(`Previous data: ${prevData.length}, New data: ${filteredData.length}, New unique data: ${newUniqueData.length}`);

                        const combinedData = [...prevData, ...newUniqueData];
                        console.log(`Combined total: ${combinedData.length} items`);
                        return combinedData;
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch card data", err);
            if (isNewRequest) {
                setCardData([]);
            }
            setHasMore(false);
            setAllDataLoaded(true);
        } finally {
            setLoadingMore(false);
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

            console.log("response options :", response.data.payload);
            setLeaveTypes(response.data.payload);
        } catch (error) {
            console.log("Data options tidak bisa diakses", error);
        }
    };

    useEffect(() => {
        if (token) {
            setIsLoading(true);
            setPage(1);
            setHasMore(true);
            setAllDataLoaded(false);
            setLoadingMore(false);
            setCardData([]);

            Promise.all([
                fetchAttendanceAnalytic(),
                fetchAttendanceCard(1, true),
                fetchOptions()
            ]).finally(() => {
                setIsLoading(false);
            });
        }
    }, [currentMonthIndex]);

    const onRefresh = (done) => {
        setTimeout(() => {
            setIsLoading(true);
            setPage(1);
            setHasMore(true);
            setAllDataLoaded(false);
            setLoadingMore(false);
            setCardData([]);

            Promise.all([
                fetchAttendanceAnalytic(),
                fetchAttendanceCard(1, true),
                fetchOptions()
            ]).finally(() => {
                setIsLoading(false);
                done();
            });
        }, 500);
    }

    const handlePrev = () => {
        if (currentMonthIndex > 0) {
            setCurrentMonthIndex(currentMonthIndex - 1);
            setActiveIndex(null);
        }
    };

    const handleNext = () => {
        if (currentMonthIndex < months.length - 1) {
            setCurrentMonthIndex(currentMonthIndex + 1);
            setActiveIndex(null);
        }
    };

    if (isLoading) {
        return (
            <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
                <Block style={{ marginTop: "5px" }}>
                    <BackButton label={translate('home_attendance', language)} />
                    <Loading height="80vh" />
                </Block>
            </Page>
        )
    }

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <Block style={{ marginTop: "5px" }} ref={listRef}>
                <BackButton label={translate('home_attendance', language)} />

                <div style={{ display: "flex", textAlign: "center", marginBottom: "10px", fontSize: "var(--font-sm)", }}>
                    <Button onClick={handlePrev} disabled={currentMonthIndex === 0} style={{ background: 'none', color: "var(--bg-primary-green)" }}>
                        <IoChevronBackOutline size={20} color='var(--bg-primary-green)' style={{ opacity: currentMonthIndex === 0 ? 0.4 : 1 }} />
                    </Button>
                    <p style={{ margin: "5px 10px", width: "100%", color: theme === "light" ? "black" : "white" }}>
                        {currentMonth.label}
                    </p>
                    <Button onClick={handleNext} disabled={currentMonthIndex === months.length - 1} style={{ background: 'none', color: "var(--bg-primary-green)" }}>
                        <IoChevronForwardOutline size={20} color='var(--bg-primary-green)' style={{ opacity: currentMonthIndex === months.length - 1 ? 0.4 : 1 }} />
                    </Button>
                </div>

                {mappedData.every(item => item.jumlah === 0) ? (
                    <div style={{ display: "flex", height: "35vh", justifyContent: "center", alignItems: "center", fontSize: "var(--font-xs)", }}>
                        <p style={{ color: theme === "light" ? "black" : "white" }}>
                            {translate('performance_no_data', language)}
                        </p>
                    </div>
                ) : (
                    <Doughnut
                        data={doughnutData}
                        options={options}
                        style={{ maxWidth: "230px", maxHeight: "230px", margin: "auto" }}
                    />
                )}

                <div style={{ marginTop: "30px", marginBottom: "50px", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "15px" }}>
                    {mappedData.map((item, index) => (
                        <div key={index}
                            style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                            onClick={() => setActiveIndex(index)}
                        >
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: "360px",
                                backgroundColor: item.color,
                            }} />

                            <div style={{ fontWeight: activeIndex === index ? 'bolder' : "normal", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1px", fontSize: "14px", color: theme === "light" ? "black" : "white" }}>
                                <p style={{ margin: "0" }}>{item.label}</p>
                                <p style={{ margin: "0" }}>({item.jumlah})</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: "25px" }}>
                    {cardData.map((item, index) => {
                        if (index === cardData.length - 1) {
                            return (
                                <div key={`${item.id}-${index}`} ref={lastElementRef}>
                                    <CardAttendance item={item} leaveTypes={leaveTypes} />
                                </div>
                            );
                        } else {
                            return <CardAttendance key={`${item.id}-${index}`} item={item} leaveTypes={leaveTypes} />;
                        }
                    })}
                </div>

                {loadingMore && (
                    <LoadingMoreAnimation />
                )}
            </Block>
        </Page>
    );
};

export default AttendancePage;