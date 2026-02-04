import { useEffect, useState, useRef, useCallback } from 'react';
import { Button, Page } from 'framework7-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSettings } from '../../slices/settingsSlice';
import CardTraining from './components/cardTraining';
import { API } from '../../api/axios';
import { IoIosClose } from 'react-icons/io';
import { labelFilter } from '../../functions/labelFilter';
import { selectLanguages } from '../../slices/languagesSlice';
import { translate } from '../../utils/translate';
import Loading from '../../components/loading';
import BackToHomeButton from '../../components/backToHomeButton';
import FilterPopup from '../../components/filterPopup';
import { trainingFormatOptions, trainingMethodOptions, trainingStatusOptions } from '../../utils/selectOptions';
import SearchInput from '../../components/searchInput';
import LoadingMoreAnimation from '../../components/loadingMoreAnimation';
import { selectActiveTabTraining, setActiveTabTraining } from '../../slices/tabTrainingSlice';
import BackButton from '../../components/backButton';

const TrainingPage = () => {
    const [allDataTraining, setAllDataTraining] = useState([]);
    const [dataOngoing, setDataOngoing] = useState([]);
    const [dataComingSoon, setDataComingSoon] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [scrollDebounceTimer, setScrollDebounceTimer] = useState(null);
    const activeTab = useSelector(selectActiveTabTraining)
    const dispatch = useDispatch()

    const token = localStorage.getItem('token');
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const [isFilterPopup, setIsFilterPopup] = useState(false);

    const observer = useRef();
    const listRef = useRef();
    const ITEMS_PER_PAGE = 10;

    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState([]);
    const [selectedFormat, setSelectedFormat] = useState([]);
    const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
    const [tempSelectedMethod, setTempSelectedMethod] = useState([]);
    const [tempSelectedFormat, setTempSelectedFormat] = useState([]);

    const trainingFilterSections = [
        {
            type: 'buttons',
            label: translate('training_status', language),
            data: trainingStatusOptions,
            selectedValues: tempSelectedStatus,
            setSelectedValues: setTempSelectedStatus
        },
        {
            type: 'buttons',
            label: translate('training_method', language),
            data: trainingMethodOptions,
            selectedValues: tempSelectedMethod,
            setSelectedValues: setTempSelectedMethod
        },
        {
            type: 'buttons',
            label: translate('training_format', language),
            data: trainingFormatOptions,
            selectedValues: tempSelectedFormat,
            setSelectedValues: setTempSelectedFormat
        }
    ];

    const openFilterPopup = () => setIsFilterPopup(true);
    const closeFilterPopup = () => setIsFilterPopup(false);

    const applyFilter = () => {
        setSelectedStatus(tempSelectedStatus);
        setSelectedMethod(tempSelectedMethod);
        setSelectedFormat(tempSelectedFormat);
        setIsFilterPopup(false);
    };

    useEffect(() => {
        if (isFilterPopup) {
            setTempSelectedStatus(selectedStatus);
            setTempSelectedMethod(selectedMethod);
            setTempSelectedFormat(selectedFormat);
        }
    }, [isFilterPopup]);

    const toggleSelection = (value, selectedValues, setSelectedValues) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter(item => item !== value));
        } else {
            setSelectedValues([...selectedValues, value]);
        }
    };

    const updateFilteredData = useCallback(() => {
        if (!allDataTraining.length) {
            setDataOngoing([]);
            setDataComingSoon([]);
            return;
        }

        const filtered = allDataTraining.filter((item) => {
            const title = item.title?.toLowerCase() || "";
            const trainerName = item.trainer_name?.toLowerCase() || "";
            const trainerPosition = item.trainer_position?.toLowerCase() || "";
            const trainerNames = item.trainers?.map(trainer => trainer.name?.toLowerCase()) || [];
            const allowedPositions = item.allowed_positions?.map(pos => pos.name?.toLowerCase()) || [];

            const matchesSearch = (
                title.includes(searchQuery) ||
                trainerName.includes(searchQuery) ||
                trainerPosition.includes(searchQuery) ||
                trainerNames.some(name => name.includes(searchQuery)) ||
                allowedPositions.some(position => position.includes(searchQuery))
            );

            const matchesStatus = selectedStatus.length === 0 ||
                (item.mandatory && selectedStatus.includes("wajib")) ||
                (!item.mandatory && selectedStatus.includes("tidak wajib"));

            const matchesMethod = selectedMethod.length === 0 ||
                selectedMethod.includes(item.method);

            const matchesFormat = selectedFormat.length === 0 ||
                selectedFormat.includes(item.training_format);

            return matchesSearch && matchesStatus && matchesMethod && matchesFormat;
        });

        const ongoing = filtered.filter(item => item.status === "active");
        const comingSoon = filtered.filter(item => item.status === "idle");

        setDataOngoing(ongoing);
        setDataComingSoon(comingSoon);
    }, [allDataTraining, searchQuery, selectedStatus, selectedMethod, selectedFormat]);

    useEffect(() => {
        updateFilteredData();
    }, [allDataTraining, searchQuery, selectedStatus, selectedMethod, selectedFormat, updateFilteredData]);

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
                        fetchTraining(nextPage, false);
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

    const fetchTraining = async (pageNumber = 1, isNewRequest = false) => {
        try {
            if (isNewRequest) {
                setIsLoading(true);
                setLoadingMore(false);
                setAllDataLoaded(false);
                setPage(1);
                setHasMore(true);
            }

            console.log(`Fetching training data for page ${pageNumber}...`);

            const response = await API.get(`/user-developments`, {
                params: {
                    cond: JSON.stringify({ "status[in]": "active,idle" }),
                    page: pageNumber,
                    limit: ITEMS_PER_PAGE,
                    sort_by: "created_at desc"
                }
            });

            console.log("Full API response:", response.data);

            const responseData = response.data.payload || [];
            const pagination = response.data.pagination;

            if (pagination) {
                setTotalPages(pagination.total_page);
                console.log(`Total pages: ${pagination.total_page}, Current page: ${pageNumber}`);

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
            } else {
                console.log(`Received ${responseData.length} items for page ${pageNumber}`);
                console.log("First item ID:", responseData[0]?.id);
                console.log("Last item ID:", responseData[responseData.length - 1]?.id);

                if (isNewRequest) {
                    setAllDataTraining(responseData);
                } else {
                    setAllDataTraining(prevData => {
                        const existingDataMap = new Map();
                        prevData.forEach(item => {
                            existingDataMap.set(item.id, item);
                        });

                        const newUniqueData = responseData.filter(item => !existingDataMap.has(item.id));

                        console.log(`Previous data: ${prevData.length}, New data: ${responseData.length}, New unique data: ${newUniqueData.length}`);

                        const overlappingIds = responseData.filter(item => existingDataMap.has(item.id)).map(item => item.id);
                        if (overlappingIds.length > 0) {
                            console.warn("Overlapping IDs detected:", overlappingIds);
                        }

                        const combinedData = [...prevData, ...newUniqueData];

                        console.log(`Combined total: ${combinedData.length} items`);
                        return combinedData;
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching training data:", error);
            setAllDataTraining([]);
            setHasMore(false);
            setAllDataLoaded(true);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTraining(1, true);
        }
    }, [token]);

    const onRefresh = (done) => {
        setIsLoading(true);
        fetchTraining(1, true);
        setTimeout(() => {
            setIsLoading(false);
            done();
        }, 500);
    }

    const handleSearch = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };

    const handleTabChange = (tabId) => {
        dispatch(setActiveTabTraining(tabId))
    };

    console.log("allDataTraining :", allDataTraining);
    console.log("dataOngoing :", dataOngoing);

    const renderTrainingList = (data, tabId) => {
        if (isLoading) {
            return <Loading height="70vh" />;
        }

        if (data.length === 0) {
            return (
                <p style={{ textAlign: "center", color: "gray", fontSize: "var(--font-xs)" }}>
                    {translate('reimburse_data_not_found', language)}
                </p>
            );
        }

        return data.map((item, index) => {
            if (index === data.length - 1 && activeTab === tabId) {
                return (
                    <div key={item.id} ref={lastElementRef}>
                        <CardTraining data={item} />
                    </div>
                );
            } else {
                return <CardTraining key={item.id} data={item} />;
            }
        });
    };

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <div ref={listRef} style={{ padding: "15px", color: theme === "light" ? "black" : "white" }}>
                <BackToHomeButton label={translate('home_training', language)} />

                <SearchInput
                    placeholder={translate('training_search', language)}
                    value={searchQuery}
                    onChange={handleSearch}
                    theme={theme}
                    openFilterPopup={openFilterPopup}
                />

                <div style={{ display: "flex", gap: "10px", marginTop: "10px", marginBottom: "20px", overflow: "auto", width: "100%" }}>
                    {[...selectedStatus, ...selectedMethod, ...selectedFormat].map((filter, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: theme == "light" ? "#E9E9E9" : "#212121",
                                padding: "5px 15px",
                                borderRadius: "20px",
                                fontSize: "var(--font-xs)",
                                fontWeight: 700,

                            }}
                            onClick={() => {
                                if (selectedStatus.includes(filter)) {
                                    const updatedStatus = selectedStatus.filter(item => item !== filter);
                                    setSelectedStatus(updatedStatus);
                                    setTempSelectedStatus(updatedStatus);
                                } else if (selectedMethod.includes(filter)) {
                                    const updatedMethod = selectedMethod.filter(item => item !== filter);
                                    setSelectedMethod(updatedMethod);
                                    setTempSelectedMethod(updatedMethod);
                                } else {
                                    const updatedFormat = selectedFormat.filter(item => item !== filter);
                                    setSelectedFormat(updatedFormat);
                                    setTempSelectedFormat(updatedFormat);
                                }
                            }}
                        >
                            <p style={{ margin: 0, minWidth: "100px", textTransform: "capitalize" }}>{labelFilter(filter, language)}</p>
                            <IoIosClose size={"12px"} />
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        background: theme === "light" ? "#FAFAFA" : "#212121",
                        fontSize: "var(--font-xs)",
                        fontWeight: 700,
                        margin: "10px 0 20px",
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
                        {translate('training_ongoing', language)}
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
                        {translate('training_coming_soon', language)}
                    </Button>
                </div>

                <div style={{ marginTop: "10px" }}>
                    <div
                        style={{
                            display: activeTab === "tab-1" ? "block" : "none",
                            marginTop: 0
                        }}
                        className="page-content"
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {renderTrainingList(dataOngoing, "tab-1")}
                        </div>
                    </div>

                    <div
                        style={{
                            display: activeTab === "tab-2" ? "block" : "none",
                            marginTop: 0
                        }}
                        className="page-content"
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {renderTrainingList(dataComingSoon, "tab-2")}
                        </div>
                    </div>
                </div>

                {loadingMore && (
                    <LoadingMoreAnimation />
                )}
            </div>

            <FilterPopup
                isFilterPopup={isFilterPopup}
                closeFilterPopup={closeFilterPopup}
                applyFilter={applyFilter}
                theme={theme}
                language={language}
                popupTitle={translate('training_filters', language)}
                filterSections={trainingFilterSections}
                toggleSelection={toggleSelection}
            />
        </Page>
    );
};

export default TrainingPage;