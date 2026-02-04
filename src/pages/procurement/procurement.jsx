import { Button, f7, Page } from 'framework7-react'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../../slices/userSlice'
import { selectSettings } from '../../slices/settingsSlice'
import CardsProcurement from './components/cardsProcurement'
import CancelPopup from '../../components/cancelPopup'
import ConfirmCancelPopup from '../../components/confirmCancelPopup'
import { API } from '../../api/axios'
import { IoIosClose } from "react-icons/io"
import { translate } from '../../utils/translate'
import { selectLanguages } from '../../slices/languagesSlice'
import { labelFilter } from '../../functions/labelFilter'
import Loading from '../../components/loading'
import BackButton from '../../components/backButton'
import NoData from '../../components/noData'
import ImageNoData from "../../assets/error/no-data.svg";
import ImageNotFound from "../../assets/error/not-found.svg";
import { formatPeriodLabel } from '../../functions/formatPeriodLabel'
import ButtonFixBottom from '../../components/buttonFixBottom'
import CustomButton from '../../components/customButton'
import FilterPopup from '../../components/filterPopup'
import { getProcurementTypeOptions, getStatusOptions } from '../../utils/selectOptions'
import SearchInput from '../../components/searchInput'
import LoadingMoreAnimation from '../../components/loadingMoreAnimation'

const ProcurementPage = () => {
    const theme = useSelector(selectSettings)
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [label, setLabel] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [idCard, setIdCard] = useState("")
    const [isCancelPopup, setIsCancelPopup] = useState(false)
    const [isCancelConfirmPopup, setIsCancelConfirmPopup] = useState(false)
    const [isFilterPopup, setIsFilterPopup] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedType, setSelectedType] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
    const [tempSelectedType, setTempSelectedType] = useState([]);
    const [tempSelectedPeriod, setTempSelectedPeriod] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [scrollDebounceTimer, setScrollDebounceTimer] = useState(null);
    const token = localStorage.getItem("token")
    const user = useSelector(selectUser)
    const language = useSelector(selectLanguages)
    const ITEMS_PER_PAGE = 10;
    const observer = useRef();
    const listRef = useRef();

    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    const procurementFilterSections = [
        {
            type: 'buttons',
            label: translate('procurement_type_sub', language),
            data: getProcurementTypeOptions(),
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

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const openFilterPopup = () => setIsFilterPopup(true);
    const closeFilterPopup = () => setIsFilterPopup(false)

    const applyFilter = () => {
        setSelectedStatus([...tempSelectedStatus]);
        setSelectedType([...tempSelectedType]);
        setSelectedPeriod(tempSelectedPeriod);
        setIsFilterPopup(false);

        setPage(1);
        setFilteredData([]);
        setHasMore(true);
        setAllDataLoaded(false);

        fetchProcurement(1, true, tempSelectedStatus, tempSelectedType, tempSelectedPeriod);
    };


    useEffect(() => {
        if (isFilterPopup) {
            setTempSelectedStatus(selectedStatus);
            setTempSelectedType(selectedType);
        }
    }, [isFilterPopup]);

    const openCancelPopup = (id, label) => {
        setIsCancelPopup(true)
        setIdCard(id)
        setLabel(label)
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
                        fetchProcurement(nextPage, false);
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

    console.log('Selected Status:', selectedStatus);
    console.log('Selected Type:', selectedType);

    const fetchProcurement = async (pageNumber = 1, isNewRequest = false, statusFilter = selectedStatus, typeFilter = selectedType, periodeFilter = selectedPeriod) => {
        if (isLoading || loadingMore) return;

        try {
            setIsLoading(isNewRequest);
            setLoadingMore(!isNewRequest);

            const conditionParams = {
                "user_id": user.id
            };

            if (debouncedSearchQuery) {
                conditionParams["title[like]"] = `%${debouncedSearchQuery}%`;
            }

            if (statusFilter.length > 0) {
                conditionParams["status[in]"] = statusFilter.join(',');
            }
            if (typeFilter.length > 0) {
                conditionParams["type_of_procurement[in]"] = typeFilter.join(',');
            }
            if (periodeFilter) {
                conditionParams["created_at[month]"] = periodeFilter;
            }

            console.log('Condition Params:', conditionParams);

            const response = await API.get("/form-request-procurement", {
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

            const responseData = response.data.payload;
            const pagination = response.data.pagination;

            console.log('Response Data:', responseData);

            if (isNewRequest) {
                setFilteredData(responseData);
                setHasMore(pagination.total_page > 1);
                setTotalPages(pagination.total_page);
            } else {
                setFilteredData(prevData => {
                    const combinedData = [...prevData, ...responseData];
                    const uniqueData = Array.from(
                        new Map(combinedData.map(item => [item.id, item])).values()
                    );
                    return uniqueData;
                });
            }

            if (pageNumber >= pagination.total_page) {
                setHasMore(false);
                setAllDataLoaded(true);
            }

        } catch (error) {
            console.error("Error fetching procurement data:", error);
            setHasMore(false);
            setAllDataLoaded(true);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchProcurement(1, true);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            console.log("Fetching data with updated filters...");
            setPage(1);
            setHasMore(true);
            setAllDataLoaded(false);
            fetchProcurement(1, true);
        }
    }, [selectedStatus, selectedType, selectedPeriod, debouncedSearchQuery]);


    const toggleSelection = (value, selectedValues, setSelectedValues) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter(item => item !== value));
        } else {
            setSelectedValues([...selectedValues, value]);
        }
    };

    const onPageBeforeIn = () => {
        setPage(1);
        setHasMore(true);
        setAllDataLoaded(false);
        fetchProcurement(1, true);
    };

    const resetPaginationState = () => {
        setPage(1);
        setHasMore(true);
        setAllDataLoaded(false);
        setLoadingMore(false);
    };

    const onRefresh = (done) => {
        setTimeout(() => {
            setIsLoading(true);
            Promise.all([
                resetPaginationState(),
                fetchProcurement(1, true)
            ]).finally(() => {
                setIsLoading(false);
                done();
            });
        }, 500);
    }


    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} onPageBeforeIn={onPageBeforeIn} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <div ref={listRef} style={{ padding: "15px", marginBottom: "90px", color: theme === "light" ? "black" : "white" }}>
                <BackButton label={translate('home_assets', language)} />

                <SearchInput
                    placeholder={translate('search_procurement', language)}
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

                {isLoading && <Loading height="70vh" />}

                {(!isLoading && filteredData.length === 0 && (selectedStatus || selectedType || searchQuery)) &&
                    <NoData image={ImageNotFound} title={translate('not_found', language)} />
                }

                {(!isLoading && filteredData.length === 0 && (!selectedStatus && !selectedType && !searchQuery)) &&
                    <NoData image={ImageNoData} title={translate('no_data_procurement', language)} />
                }

                {
                    (!isLoading && filteredData.length > 0) &&
                    filteredData.map((item, index) => {
                        if (index === filteredData.length - 1) {
                            return (
                                <div key={item.id || `item-${index}`} ref={lastElementRef}>
                                    <CardsProcurement item={item} openCancelPopup={openCancelPopup} />
                                </div>
                            );
                        } else {
                            return <CardsProcurement key={item.id || `item-${index}`} item={item} openCancelPopup={openCancelPopup} />;
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
                    text={translate('submit_procurement', language)}
                    handleClick={() => f7.views.main.router.navigate('/procurement-submission/')}
                />
            </ButtonFixBottom>

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
                onCancelSuccess={() => fetchProcurement(1, true)}
            />

            <FilterPopup
                isFilterPopup={isFilterPopup}
                closeFilterPopup={closeFilterPopup}
                applyFilter={applyFilter}
                theme={theme}
                language={language}
                popupTitle="Filter"
                filterSections={procurementFilterSections}
                toggleSelection={toggleSelection}
            />
        </Page>
    )
}

export default ProcurementPage