import { useEffect, useState, useRef, useCallback } from 'react';
import { f7, Page } from 'framework7-react';
import ImageNoData from "../../assets/error/no-data.svg";
import ImageNotFound from "../../assets/error/not-found.svg";
import { useSelector } from 'react-redux';
import { selectSettings } from '../../slices/settingsSlice';
import { API } from '../../api/axios';
import { selectUser } from '../../slices/userSlice';
import CancelPopup from '../../components/cancelPopup';
import ConfirmCancelPopup from '../../components/confirmCancelPopup';
import CardReimburse from './components/cardRiemburse';
import { selectLanguages } from '../../slices/languagesSlice';
import { translate } from '../../utils/translate';
import Loading from '../../components/loading';
import NoData from '../../components/noData';
import { labelFilter } from '../../functions/labelFilter';
import { IoIosClose } from 'react-icons/io';
import { formatPeriodLabel } from '../../functions/formatPeriodLabel';
import BackButton from '../../components/backButton';
import ButtonFixBottom from '../../components/buttonFixBottom';
import CustomButton from '../../components/customButton';
import FilterPopup from '../../components/filterPopup';
import { getStatusOptions } from '../../utils/selectOptions';
import SearchInput from '../../components/searchInput';
import LoadingMoreAnimation from '../../components/loadingMoreAnimation';

const ReimbursePage = () => {
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [gradeData, setGradeData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [idCard, setIdCard] = useState("");
    const [label, setLabel] = useState("");
    const [isCancelPopup, setIsCancelPopup] = useState(false);
    const [isCancelConfirmPopup, setIsCancelConfirmPopup] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [scrollDebounceTimer, setScrollDebounceTimer] = useState(null);
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages)
    const user = useSelector(selectUser);
    const token = localStorage.getItem("token");
    const observer = useRef();
    const listRef = useRef();
    const ITEMS_PER_PAGE = 10;

    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterPopup, setIsFilterPopup] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedType, setSelectedType] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
    const [tempSelectedType, setTempSelectedType] = useState([]);
    const [tempSelectedPeriod, setTempSelectedPeriod] = useState(null);
    const openFilterPopup = () => setIsFilterPopup(true);
    const closeFilterPopup = () => setIsFilterPopup(false);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    console.log("tempSelectedPeriod :", tempSelectedPeriod);
    console.log("selectedPeriod :", selectedPeriod);


    const transformedGradeData = gradeData.map(item => ({
        value: item.name,
        label: item.name
    }));

    const reimburseFilterSections = [
        {
            type: 'buttons',
            label: translate('detail_reimburse_type', language),
            data: transformedGradeData,
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
            label: translate('period', language),
            periodValue: tempSelectedPeriod,
            setPeriodValue: setTempSelectedPeriod
        }
    ];

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const openCancelPopup = (id, label) => {
        setIsCancelPopup(true);
        setIdCard(id);
        setLabel(label);
    };

    const applyFilter = () => {
        setSelectedStatus([...tempSelectedStatus]);
        setSelectedType([...tempSelectedType]);
        setSelectedPeriod(tempSelectedPeriod);
        setIsFilterPopup(false);

        setPage(1);
        setAllData([]);
        setHasMore(true);
        setAllDataLoaded(false);

        fetchReimburse(1, true, tempSelectedStatus, tempSelectedType, tempSelectedPeriod);
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
                        fetchReimburse(nextPage, false);
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

    const fetchOptions = async () => {
        try {
            const response = await API.get("/reimbursement-category-grade", {
                params: {
                    page: 1,
                    sort_by: "created_at desc",
                    limit: 100,
                },
            });

            const data = response.data.payload
            console.log("reimburse category :", data);
            setGradeData(data)
        } catch (error) {
            console.log("Data options tidak bisa diakses", error);
        }
    };

    const filterGradeId = (categoryId) => {
        const found = gradeData.find(item => item.id === categoryId);
        if (found) {
            return found.name || translate('unknown_category_name', language);
        }
        return translate('category_not_found', language);
    };


    const fetchReimburse = async (pageNumber = 1, isNewRequest = false, statusFilter = selectedStatus, typeFilter = selectedType, periodeFilter = selectedPeriod) => {
        try {
            if (isNewRequest) {
                setIsLoading(true);
                setLoadingMore(false);
                setAllDataLoaded(false);
            }

            console.log(`Fetching reimbursement data for page ${pageNumber}...`);

            const conditionParam = {
                "user_id": user.id
            };

            if (debouncedSearchQuery) {
                conditionParam["title[like]"] = `%${debouncedSearchQuery}%`;
            }

            if (periodeFilter) {
                conditionParam["created_at[month]"] = periodeFilter;
            }

            if (statusFilter.length > 0) {
                conditionParam["status[in]"] = statusFilter.join(',');
            }

            if (typeFilter.length > 0) {
                conditionParam["reimbursement_name[in]"] = typeFilter.join(',');
            }

            console.log("conditionParam :", conditionParam);

            const response = await API.get("/form-request-reimbursement", {
                params: {
                    page: pageNumber,
                    cond: JSON.stringify(conditionParam),
                    sort_by: "created_at desc",
                    limit: ITEMS_PER_PAGE,
                },
                paramsSerializer: params => {
                    return new URLSearchParams(params).toString();
                }
            });

            console.log("Full API response:", response.data);

            const responseData = response.data.payload || [];
            const pagination = response.data.pagination;

            if (isNewRequest) {
                setAllData(responseData);
            } else {
                setAllData(prevData => {
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
            }

        } catch (error) {
            console.error("Error fetching reimbursement data:", error);
            setHasMore(false);
            setAllDataLoaded(true);

            if (isNewRequest) {
                setAllData([]);
            }
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (token) {
            setPage(1);
            setHasMore(true);
            setAllDataLoaded(false);

            fetchReimburse(1, true);
        }
    }, [selectedStatus, selectedType, selectedPeriod]);

    useEffect(() => {
        if (token) {
            fetchReimburse(1, true);
            fetchOptions();
        }
    }, [token]);

    const onPageBeforeIn = () => {
        fetchReimburse(1, true);
        fetchOptions()
    };

    const onRefresh = (done) => {
        setTimeout(() => {
            setIsLoading(true);
            Promise.all([
                fetchReimburse(1, true),
                fetchOptions()
            ]).finally(() => {
                setIsLoading(false);
                done();
            });
        }, 500);
    }

    useEffect(() => {
        if (token) {
            fetchReimburse(1, true);
        }

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
            if (scrollDebounceTimer) {
                clearTimeout(scrollDebounceTimer);
            }
        };
    }, [token]);

    useEffect(() => {
        let filtered = allData;

        if (searchQuery.trim()) {
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedStatus.length > 0) {
            filtered = filtered.filter(item => selectedStatus.includes(item.status));
        }

        if (selectedType.length > 0) {
            filtered = filtered.filter(item => selectedType.includes(item.reimbursement_name));
        }

        setFilteredData(filtered);
    }, [searchQuery, selectedStatus, selectedType, allData]);

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} onPageBeforeIn={onPageBeforeIn} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <div ref={listRef} style={{ padding: "15px", marginBottom: "90px", color: theme == "light" ? "black" : "white" }}>
                <BackButton label="Reimburse" />

                <SearchInput
                    placeholder={translate('search_reimburse', language)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    theme={theme}
                    openFilterPopup={openFilterPopup}
                />

                <div style={{ display: "flex", gap: "10px", marginTop: "10px", overflow: "auto", width: "100%" }}>
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
                                cursor: "pointer"
                            }}
                            onClick={() => {
                                if (selectedStatus.includes(filter)) {
                                    setSelectedStatus(prev => prev.filter(item => item !== filter));
                                } else if (selectedType.includes(filter)) {
                                    setSelectedType(prev => prev.filter(item => item !== filter));
                                } else if (filter === selectedPeriod) {
                                    setSelectedPeriod(null);
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

                {isLoading && <Loading height="70vh" />}

                {(!isLoading && filteredData.length === 0 && (selectedStatus.length > 0 || selectedType.length > 0 || selectedPeriod || searchQuery)) &&
                    <NoData image={ImageNotFound} title={translate('not_found', language)} />
                }

                {(!isLoading && filteredData.length === 0 && (!selectedStatus.length && !selectedType.length && !selectedPeriod && !searchQuery)) &&
                    <NoData image={ImageNoData} title={translate('no_data_reimburse', language)} />
                }

                {
                    (!isLoading && filteredData.length > 0) &&
                    filteredData.map((item, index) => {
                        if (index === filteredData.length - 1) {
                            return (
                                <div key={item.id || `item-${index}`} ref={lastElementRef}>
                                    <CardReimburse data={item} openCancelPopup={openCancelPopup} filterGradeId={filterGradeId} />
                                </div>
                            );
                        } else {
                            return <CardReimburse key={item.id || `item-${index}`} data={item} openCancelPopup={openCancelPopup} filterGradeId={filterGradeId} />;
                        }
                    })
                }

                {loadingMore && (
                    <LoadingMoreAnimation />
                )}
            </div>

            <ButtonFixBottom needBorderTop={true}>
                <CustomButton
                    color={"white"}
                    bg={"var(--bg-primary-green)"}
                    text={translate('reimburse_submit', language)}
                    handleClick={() => f7.views.main.router.navigate('/reimburse-submission/')}
                />
            </ButtonFixBottom>

            <FilterPopup
                isFilterPopup={isFilterPopup}
                closeFilterPopup={closeFilterPopup}
                applyFilter={applyFilter}
                theme={theme}
                language={language}
                popupTitle="Filter"
                filterSections={reimburseFilterSections}
                toggleSelection={toggleSelection}
            />

            <CancelPopup
                label={label}
                opened={isCancelPopup}
                onClose={() => setIsCancelPopup(false)}
                openConfirm={() => setIsCancelConfirmPopup(true)}
            />

            <ConfirmCancelPopup
                popupOpened={isCancelConfirmPopup}
                setIsCancelConfirmPopup={setIsCancelConfirmPopup}
                setIsCancelPopup={setIsCancelPopup}
                idCard={idCard}
                onCancelSuccess={() => fetchReimburse(1, true)}
            />
        </Page>
    );
};

export default ReimbursePage;