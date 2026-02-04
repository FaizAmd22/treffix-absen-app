import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button, f7, Link, Page } from 'framework7-react';
import CardPermission from './components/cardPermission';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../slices/settingsSlice';
import CancelPopup from '../../components/cancelPopup';
import ConfirmCancelPopup from '../../components/confirmCancelPopup';
import { API } from '../../api/axios';
import { selectUser } from '../../slices/userSlice';
import { translate } from '../../utils/translate';
import { selectLanguages } from '../../slices/languagesSlice';
import Loading from '../../components/loading';
import NoData from '../../components/noData';
import ImageNoData from "../../assets/error/no-data.svg";
import ImageNotFound from "../../assets/error/not-found.svg";
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { IoIosClose } from 'react-icons/io';
import { formatPeriodLabel } from '../../functions/formatPeriodLabel';
import { labelFilter } from '../../functions/labelFilter';
import { FaChevronRight } from 'react-icons/fa';
import ChartPermission from './components/chartPermission';
import { formatDate } from '../../functions/formatDate';
import BackButton from '../../components/backButton';
import ButtonFixBottom from '../../components/buttonFixBottom';
import CustomButton from '../../components/customButton';
import FilterPopup from '../../components/filterPopup';
import { getStatusOptions } from '../../utils/selectOptions';
import LoadingMoreAnimation from '../../components/loadingMoreAnimation';
import { showToastFailed } from '../../functions/toast';
import ReimburseIcon from '../../icons/reimburse';

const PermissionPage = () => {
    const theme = useSelector(selectSettings);
    const [count, setCount] = useState([]);
    const [idCard, setIdCard] = useState("");
    const [isCancelPopup, setIsCancelPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCancelConfirmPopup, setIsCancelConfirmPopup] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [scrollDebounceTimer, setScrollDebounceTimer] = useState(null);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [totalLeave, setTotalLeave] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [isShowLabel, setIsShowLabel] = useState(true);
    const token = localStorage.getItem("token");
    const user = useSelector(selectUser);
    const language = useSelector(selectLanguages);
    const ITEMS_PER_PAGE = 10;
    const observer = useRef();
    const listRef = useRef();

    const [filteredData, setFilteredData] = useState([]);
    const [isFilterPopup, setIsFilterPopup] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedType, setSelectedType] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
    const [tempSelectedType, setTempSelectedType] = useState([]);
    const [tempSelectedPeriod, setTempSelectedPeriod] = useState(null);

    const transformedLeaveTypes = leaveTypes.map(item => ({
        value: item.name,
        label: item.name
    }));

    const permissionFilterSections = [
        {
            type: 'buttons',
            label: translate('type_permission', language),
            data: transformedLeaveTypes,
            selectedValues: tempSelectedType,
            setSelectedValues: setTempSelectedType
        },
        {
            type: 'buttons',
            label: translate('procurement_status_sub', language),
            data: getStatusOptions(language),
            selectedValues: tempSelectedStatus,
            setSelectedValues: setTempSelectedStatus
        },
        {
            type: 'period',
            label: translate('reimburse_choose_month', language),
            periodValue: tempSelectedPeriod,
            setPeriodValue: setTempSelectedPeriod
        }
    ];

    const openFilterPopup = () => setIsFilterPopup(true);
    const closeFilterPopup = () => setIsFilterPopup(false);

    const applyFilter = () => {
        setSelectedStatus([...tempSelectedStatus]);
        setSelectedType([...tempSelectedType]);
        setSelectedPeriod(tempSelectedPeriod);
        setIsFilterPopup(false);

        setPage(1);
        setHasMore(true);
        setAllDataLoaded(false);

        fetchPermission(1, true, tempSelectedStatus, tempSelectedType, tempSelectedPeriod);
    };

    const toggleSelection = (value, selectedValues, setSelectedValues) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter(item => item !== value));
        } else {
            setSelectedValues([...selectedValues, value]);
        }
    };

    useEffect(() => {
        if (isFilterPopup) {
            setTempSelectedStatus(selectedStatus);
            setTempSelectedType(selectedType);
            setTempSelectedPeriod(selectedPeriod);
        }
    }, [isFilterPopup]);

    useEffect(() => {
        if (token) {
            console.log("Fetching data with updated filters...");
            setPage(1);
            setHasMore(true);
            setAllDataLoaded(false);
            fetchPermission(1, true);
        }
    }, [selectedStatus, selectedType, selectedPeriod]);

    const openCancelPopup = (id) => {
        setIsCancelPopup(true);
        setIdCard(id);
    };

    const fetchPermission = async (pageNumber = 1, isNewRequest = false, statusFilter = selectedStatus, typeFilter = selectedType, periodeFilter = selectedPeriod) => {
        try {
            if (isNewRequest) {
                setIsLoading(true);
                setLoadingMore(false);
                setAllDataLoaded(false);
            }

            const conditionParams = {
                "user_id": user.id
            };

            if (statusFilter.length > 0) {
                conditionParams["status[in]"] = statusFilter.join(',');
            }

            if (typeFilter.length > 0) {
                conditionParams["type_of_leave[in]"] = typeFilter.join(',');
            }

            if (periodeFilter) {
                conditionParams["created_at[month]"] = periodeFilter;
            }

            console.log("conditionParams :", conditionParams);

            const response = await API.get("/form-request-leave", {
                params: {
                    page: pageNumber,
                    cond: JSON.stringify(conditionParams),
                    sort_by: "created_at desc",
                    limit: ITEMS_PER_PAGE,
                },
                paramsSerializer: params => {
                    return new URLSearchParams(params).toString();
                }
            });

            console.log("data fetch :", response.data);
            const responseData = response.data.payload || [];
            const pagination = response.data.pagination;

            if (isNewRequest) {
                setFilteredData(responseData);
            } else {
                setFilteredData(prevData => {
                    const combinedData = [...prevData, ...responseData];
                    const uniqueData = [];
                    const seenIds = new Set();

                    for (const item of combinedData) {
                        if (!seenIds.has(item.id)) {
                            seenIds.add(item.id);
                            uniqueData.push(item);
                        }
                    }

                    console.log(`Combined ${combinedData.length} items, filtered to ${uniqueData.length} unique items`);
                    return uniqueData;
                });
            }

            if (pagination) {
                setTotalPages(pagination.total_page)

                if (pageNumber >= pagination.total_page) {
                    setHasMore(false);
                    setAllDataLoaded(true);
                    console.log("Reached last page, no more data to load");
                }
            }

            if (responseData.length === 0) {
                console.log("No data received");
                setHasMore(false);
                setAllDataLoaded(true);
            }
        } catch (error) {
            console.error("Error fetching permission data:", error);
            setHasMore(false);
            setAllDataLoaded(true);

            if (isNewRequest) {
                setFilteredData([]);
            }
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchChartData = async () => {
        try {
            const response = await API.get("/mobile/user-leave-statistic?sort_by=created_at+asc");
            const data = response.data.payload;
            const userJoined = user.join_date;
            const currentPeriod = getPeriodForDate(new Date(), userJoined);
            console.log("data statisric :", data);

            const currentPeriodData = data.filter(item => {
                const dateForFiltering = item.type_of_leave === 'LCT' && item.start_date
                    ? item.start_date
                    : item.created_at;

                const itemPeriod = getPeriodForDate(dateForFiltering, userJoined);
                return itemPeriod.key === currentPeriod.key;
            });

            console.log("currentPeriodData :", currentPeriodData);


            const totalLeave = currentPeriodData.reduce((total, item) => {
                if (
                    item.type === "sum" &&
                    item.status !== "expired" &&
                    item.type_of_leave !== "LCT"
                ) {
                    return total + item.amount;
                }
                return total;
            }, 0);

            const usedLeave = data.reduce((total, item) => {
                if (
                    item.type === "min" &&
                    item.status !== "expired"
                ) {
                    return total + item.amount;
                }
                return total;
            }, 0);

            const usedLeaveThisPeriod = currentPeriodData.reduce((total, item) => {
                if (
                    item.type === "min" &&
                    item.status !== "expired"
                ) {
                    return total + item.amount;
                }
                return total;
            }, 0);

            const grandLeave = currentPeriodData.reduce((total, item) => {
                if (
                    item.type_of_leave === "LCT"
                ) {
                    return total + item.amount;
                }
                return total;
            }, 0);

            const remainingLeave = Math.max(0, totalLeave - usedLeaveThisPeriod);
            if (remainingLeave > 0) {
                localStorage.setItem('hasLeaveBalance', true)
            } else {
                localStorage.setItem('hasLeaveBalance', false)
            }

            let dataChart = []

            if (grandLeave && data.length > 0) {
                dataChart = [
                    { value: remainingLeave, name: "Sisa Cuti" },
                    { value: grandLeave, name: "Cuti Besar" },
                    { value: usedLeaveThisPeriod, name: "Cuti Terpakai" },
                ];
            } else if (!grandLeave && data.length > 0) {
                dataChart = [
                    { value: remainingLeave, name: "Sisa Cuti" },
                    { value: usedLeaveThisPeriod, name: "Cuti Terpakai" },
                ];
            } else {
                setIsShowLabel(false)
                localStorage.setItem('hasLeaveBalance', false)
                dataChart = [
                    { value: 100, name: "Cuti Kosong" },
                ];
            }

            setTotalLeave(totalLeave + grandLeave);
            setChartData(dataChart);

            console.log("Current period:", currentPeriod);
            console.log("Total leave (current period):", totalLeave);
            console.log("Used leave (current period):", usedLeave);
            console.log("Remaining leave:", remainingLeave);
        } catch (error) {
            console.log("Error fetching chart data:", error);
        }
    };

    const getPeriodForDate = (date, joinDate) => {
        const joinDateObj = new Date(joinDate);
        const targetDate = new Date(date);

        const joinMonth = joinDateObj.getMonth();
        const joinDay = joinDateObj.getDate();

        let periodYear = targetDate.getFullYear();

        const periode = new Date(periodYear - 1, joinMonth, joinDay);
        if (targetDate < periode) {
            periodYear -= 1;
        }

        const periodStart = new Date(periodYear, joinMonth, joinDay);
        const periodEnd = new Date(periodYear + 1, joinMonth, joinDay - 1);

        return {
            startDate: periodStart,
            endDate: periodEnd,
            key: `${periodStart.getFullYear()}-${periodEnd.getFullYear()}`,
            label: `${formatDate(periodStart)} - ${formatDate(periodEnd)}`
        };
    };

    const fetchCount = async () => {
        try {
            const response = await API.get("/mobile/user-leave-count");

            console.log("response fetchCount :", response.data);
            setCount(response.data.payload.count)
        } catch (error) {
            console.log("error :", error);
        }
    }

    const fetchOptions = async () => {
        try {
            const response = await API.get("/type-of-leave", {
                params: {
                    page: 1,
                    sort_by: "created_at desc",
                    limit: 100,
                },
            });

            console.log("response options :", response);
            setLeaveTypes(response.data.payload);
        } catch (error) {
            console.log("Data options tidak bisa diakses", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCount()
            fetchOptions()
            fetchChartData()
            fetchPermission(1, true);
        }
    }, [token]);

    const refreshData = () => {
        fetchCount();
        fetchChartData();
        fetchPermission(1, true);
    };

    const onPageBeforeIn = () => {
        fetchCount()
        fetchOptions()
        fetchChartData()
        fetchPermission(1, true);
    };

    const onRefresh = (done) => {
        setTimeout(() => {
            setIsLoading(true);
            Promise.all([
                fetchCount(),
                fetchOptions(),
                fetchChartData(),
                fetchPermission(1, true)
            ]).finally(() => {
                setIsLoading(false);
                done();
            });
        }, 500);
    }

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
                        fetchPermission(nextPage, false);
                    } else {
                        console.log("All pages loaded. No more data to fetch.");
                        setAllDataLoaded(true);
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

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} onPageBeforeIn={onPageBeforeIn} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <div ref={listRef} style={{ padding: "15px", marginBottom: "90px", color: theme === "light" ? "black" : "white" }}>
                <Link href="/leave-history/" style={{ width: "24px", height: "24px", position: "absolute", top: 36, right: 20 }}>
                    <ReimburseIcon fillColor="var(--bg-primary-green)" width={28} height={28} />
                </Link>

                <BackButton label={translate('home_permission', language)} />

                <div onClick={openFilterPopup} style={{ display: "flex", gap: "10px", alignItems: "center", border: theme == "light" ? "1px solid var(--border-primary-gray)" : "1px solid #363636", padding: "10px", borderRadius: "8px", marginTop: "20px" }}>
                    <HiOutlineAdjustmentsHorizontal size={"24px"} style={{ color: "var(--bg-primary-green)" }} />
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ margin: 0, fontSize: "var(--font-md)" }}>Filter</p>
                        <FaChevronRight style={{ fontSize: "13px", opacity: 0.7, color: "var(--bg-primary-green)" }} />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "10px", overflow: "auto", width: "100%" }}>
                    {[...selectedStatus, ...selectedType, ...(selectedPeriod ? [selectedPeriod] : [])].map((filter, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: theme == "light" ? "#E9E9E9" : "#212121",
                                padding: "5px 15px",
                                borderRadius: "20px",
                                fontSize: "var(--font-sm)",
                                fontWeight: 700,
                                textTransform: "capitalize",
                                cursor: "pointer",
                                marginTop: "15px",
                                marginBottom: "5px"
                            }}
                            onClick={() => {
                                if (selectedStatus.includes(filter)) {
                                    setSelectedStatus(prev => {
                                        const updatedStatus = prev.filter(item => item !== filter);
                                        setTempSelectedStatus(updatedStatus);
                                        return updatedStatus;
                                    });
                                } else if (selectedType.includes(filter)) {
                                    setSelectedType(prev => {
                                        const updatedType = prev.filter(item => item !== filter);
                                        setTempSelectedType(updatedType);
                                        return updatedType;
                                    });
                                } else if (filter === selectedPeriod) {
                                    setSelectedPeriod(null);
                                    setTempSelectedPeriod(null);
                                }
                            }}
                        >
                            <p style={{ margin: 0, minWidth: "120px" }}>
                                {filter === selectedPeriod ? formatPeriodLabel(filter, language) : labelFilter(filter, language)}
                            </p>
                            <IoIosClose size={"16px"} />
                        </div>
                    ))}
                </div>

                {/*<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: theme === "light" ? "#D4E2FD" : "rgba(40, 111, 243, 0.2)", padding: "0px 15px", borderRadius: "8px", marginTop: "10px", fontSize: "var(--font-sm)" }}>
                    <p>{translate('permission_leave_amount', language)}</p>
                    <p style={{ fontWeight: 700 }}>{count}</p>
                </div>*/}

                <ChartPermission chartData={chartData} theme={theme} />

                <div style={{ width: "100%", textAlign: "center", position: "absolute", marginTop: "-108px", marginLeft: "-16px", display: "flex", alignItems: "center", flexDirection: "column" }}>
                    <p style={{ color: theme == "light" ? '#6C6C6C' : "white", fontSize: "var(--font-sm)", width: "50%", margin: 0 }}>{translate('total_leave_balance', language)}</p>
                    <p style={{ fontSize: "28px", fontWeight: 700, width: "50%", margin: 0 }}>{totalLeave}</p>

                    {isShowLabel && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "15px" }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '12px', height: '12px', backgroundColor: '#737AFC', borderRadius: '50%' }}></div>
                                <p style={{ fontSize: 'var(--font-sm)', margin: 0 }}>{translate('leave_remaining', language)}</p>
                            </div>

                            {chartData.find(item => item.name == "Cuti Besar") && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{ width: '12px', height: '12px', backgroundColor: '#85F195', borderRadius: '50%' }}></div>
                                    <p style={{ fontSize: 'var(--font-sm)', margin: 0 }}>{translate('sabbatical_leave', language)}</p>
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '12px', height: '12px', backgroundColor: '#FC9595', borderRadius: '50%' }}></div>
                                <p style={{ fontSize: 'var(--font-sm)', margin: 0 }}>{translate('used_leave', language)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {isLoading && <Loading height="70vh" />}

                {(!isLoading && filteredData.length === 0 && (selectedStatus.length > 0 || selectedType.length > 0 || selectedPeriod)) &&
                    <NoData image={ImageNotFound} title={translate('not_found', language)} />
                }

                {(!isLoading && filteredData.length === 0 && (!selectedStatus.length && !selectedType.length && !selectedPeriod)) &&
                    <NoData image={ImageNoData} title={translate('no_data_permission', language)} />
                }

                <div style={{ marginTop: isShowLabel ? "0px" : "-30px" }}>
                    {(!isLoading && filteredData.length > 0) &&
                        filteredData.map((item, index) => {
                            if (index === filteredData.length - 1) {
                                return (
                                    <div key={item.id || `item-${index}`} ref={lastElementRef}>
                                        <CardPermission openCancelPopup={openCancelPopup} data={item} leaveTypes={leaveTypes} />
                                    </div>
                                );
                            } else {
                                return <CardPermission key={item.id || `item-${index}`} openCancelPopup={openCancelPopup} data={item} leaveTypes={leaveTypes} />;
                            }
                        })
                    }
                </div>

                {loadingMore && (
                    <LoadingMoreAnimation />
                )}
            </div>

            <ButtonFixBottom needBorderTop={true}>
                <CustomButton
                    color={"white"}
                    bg={"var(--bg-primary-green)"}
                    text={translate('apply_permission', language)}
                    handleClick={() => f7.views.main.router.navigate('/permission-submission/')}
                // disable
                />
            </ButtonFixBottom>

            {idCard && (
                <CancelPopup
                    label={filteredData[idCard]?.type_of_leave === "cuti" ? translate('permission', language) : translate('leave', language)}
                    opened={isCancelPopup}
                    onClose={() => setIsCancelPopup(false)}
                    openConfirm={() => setIsCancelConfirmPopup(true)}
                />
            )}

            <ConfirmCancelPopup
                popupOpened={isCancelConfirmPopup}
                setIsCancelConfirmPopup={setIsCancelConfirmPopup}
                setIsCancelPopup={setIsCancelPopup}
                idCard={idCard}
                onCancelSuccess={refreshData}
            />

            <FilterPopup
                isFilterPopup={isFilterPopup}
                closeFilterPopup={closeFilterPopup}
                applyFilter={applyFilter}
                theme={theme}
                language={language}
                popupTitle="Filter"
                filterSections={permissionFilterSections}
                toggleSelection={toggleSelection}
            />
        </Page>
    );
};

export default PermissionPage;