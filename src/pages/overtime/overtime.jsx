import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../slices/settingsSlice';
import { selectLanguages } from '../../slices/languagesSlice';
import { API } from '../../api/axios';
import { Button, f7, Page } from 'framework7-react';
import { translate } from '../../utils/translate';
import BackButton from '../../components/backButton';
import Loading from '../../components/loading';
import ConfirmCancelPopup from '../../components/confirmCancelPopup';
import CancelPopup from '../../components/cancelPopup';
import CardOvertime from './components/cardOvertime';
import { selectUser } from '../../slices/userSlice';
import { IoIosClose } from "react-icons/io";
import { BiSearchAlt } from 'react-icons/bi';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { labelFilter } from '../../functions/labelFilter';
import { IoClose } from 'react-icons/io5';
import { showToastFailed } from '../../functions/toast';
import NoData from '../../components/noData';
import ImageNoData from "../../assets/error/no-data.svg";
import ImageNotFound from "../../assets/error/not-found.svg";
import { formatPeriodLabel } from '../../functions/formatPeriodLabel';
import FilterOvertimePopup from './components/filterPopup'
import ButtonFixBottom from '../../components/buttonFixBottom';
import CustomButton from '../../components/customButton';
import FilterPopup from '../../components/filterPopup';
import { getStatusOptions } from '../../utils/selectOptions';
import SearchInput from '../../components/searchInput';
import LoadingMoreAnimation from '../../components/loadingMoreAnimation';

const OvertimePage = () => {
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const selectedUser = useSelector(selectUser);

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [optionTypes, setOptionTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [scrollDebounceTimer, setScrollDebounceTimer] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [isFilterPopup, setIsFilterPopup] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedType, setSelectedType] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
    const [tempSelectedType, setTempSelectedType] = useState([]);
    const [tempSelectedPeriod, setTempSelectedPeriod] = useState(null);

    const [idCard, setIdCard] = useState('');
    const [label, setLabel] = useState('');
    const [isCancelPopup, setIsCancelPopup] = useState(false);
    const [isCancelConfirmPopup, setIsCancelConfirmPopup] = useState(false);

    const observer = useRef();
    const ITEMS_PER_PAGE = 10;

    const transformedOvertimeType = optionTypes.map(item => ({
        value: item.name,
        label: item.name
    }));

    const overtimeFilterSections = [
        {
            type: 'buttons',
            label: translate('overtime_type', language),
            data: transformedOvertimeType,
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

    const openFilterPopup = () => setIsFilterPopup(true);
    const closeFilterPopup = () => setIsFilterPopup(false);

    const applyFilter = () => {
        setSelectedStatus([...tempSelectedStatus]);
        setSelectedType([...tempSelectedType]);
        setSelectedPeriod(tempSelectedPeriod);
        setIsFilterPopup(false);

        setPage(1);
        setData([]);
        setHasMore(true);
        setAllDataLoaded(false);

        fetchOvertime(1, true, tempSelectedStatus, tempSelectedType, tempSelectedPeriod);
    };

    useEffect(() => {
        if (isFilterPopup) {
            setTempSelectedStatus(selectedStatus);
            setTempSelectedType(selectedType);
            setTempSelectedPeriod(selectedPeriod);
        }
    }, [isFilterPopup]);

    const toggleSelection = (value, selectedValues, setSelectedValues) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter(item => item !== value));
        } else {
            setSelectedValues([...selectedValues, value]);
        }
    };

    const fetchOptionTypes = async () => {
        try {
            const resp = await API.get('/type-of-overtime', {
                params: { limit: 100, cond: JSON.stringify({ status: 'active' }), sort_by: 'created_at asc' }
            });
            setOptionTypes(resp.data.payload);
        } catch (err) {
            console.error('Failed to fetch option types', err);
        }
    };

    const fetchOvertime = async (pageNumber = 1, isNewRequest = false, statusFilter = selectedStatus, typeFilter = selectedType, periodeFilter = selectedPeriod) => {
        if (isLoading || loadingMore) return;

        try {
            setIsLoading(isNewRequest);
            setLoadingMore(!isNewRequest);

            const conditionParams = {
                "user_id": selectedUser.id
            };

            if (debouncedSearchQuery) {
                conditionParams["search"] = `%${debouncedSearchQuery}%`;
            }

            if (statusFilter.length > 0) {
                conditionParams["status[in]"] = statusFilter.join(',');
            }
            if (typeFilter.length > 0) {
                conditionParams["type_of_overtime[in]"] = typeFilter.join(',');
            }
            if (periodeFilter) {
                conditionParams["created_at[month]"] = periodeFilter;
            }

            console.log("conditionParams :", conditionParams);


            const params = {
                page: pageNumber,
                limit: ITEMS_PER_PAGE,
                sort_by: 'created_at desc',
                cond: JSON.stringify(conditionParams)
            };

            const response = await API.get('/form-request-overtime', { params });
            const responseData = response.data.payload || [];
            const pagination = response.data.pagination || {};

            if (isNewRequest) {
                setData(responseData);
                setHasMore(pagination.total_page > 1);
                setTotalPages(pagination.total_page);
            } else {
                setData(prevData => {
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
            console.error('Error fetching overtime data:', error);
            setHasMore(false);
            setAllDataLoaded(true);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        let filtered = data;
        setFilteredData(filtered);
    }, [selectedStatus, selectedType, data]);

    useEffect(() => {
        if (selectedUser.id) {
            setPage(1);
            setHasMore(true);
            setAllDataLoaded(false);
            fetchOvertime(1, true);
        }
    }, [selectedStatus, selectedType, selectedPeriod, debouncedSearchQuery]);

    const lastItemRef = useCallback(node => {
        if (loadingMore || allDataLoaded) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore && !allDataLoaded) {
                if (scrollDebounceTimer) {
                    clearTimeout(scrollDebounceTimer);
                }

                setLoadingMore(true);
                const timer = setTimeout(() => {
                    if (page < totalPages) {
                        const nextPage = page + 1;
                        setPage(nextPage);
                        fetchOvertime(nextPage, false);
                    } else {
                        setAllDataLoaded(true);
                    }
                }, 700);

                setScrollDebounceTimer(timer);
            }
        }, { threshold: 0.1 });

        if (node) observer.current.observe(node);
    }, [hasMore, loadingMore, page, totalPages, allDataLoaded, scrollDebounceTimer]);

    useEffect(() => {
        fetchOvertime(1, true);
        fetchOptionTypes();
        return () => {
            if (observer.current) observer.current.disconnect();
            if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
        };
    }, []);

    const resetPaginationState = () => {
        setPage(1);
        setHasMore(true);
        setAllDataLoaded(false);
        setLoadingMore(false);
    };

    const onRefresh = done => {
        setTimeout(() => {
            setIsLoading(true);
            Promise.all([
                resetPaginationState(),
                fetchOvertime(1, true)
            ]).finally(() => {
                setIsLoading(false);
                done();
            });
        }, 500);
    };

    const onPageBeforeIn = () => {
        setPage(1);
        setHasMore(true);
        setAllDataLoaded(false);
        fetchOvertime(1, true);
        fetchOptionTypes();
    };

    const handleLink = () => {
        if (!selectedUser.is_overtime) {
            showToastFailed(translate('not_allowed_overtime', language))
        } else {
            f7.views.main.router.navigate('/overtime-submission/')
        }
    }

    return (
        <Page
            onPageBeforeIn={onPageBeforeIn}
            ptr ptrMousewheel
            onPtrRefresh={onRefresh}
            style={{ background: theme === 'light' ? 'var(--bg-primary-white)' : 'var(--bg-secondary-black)' }}
        >
            <div style={{ padding: '15px', marginBottom: '90px', color: theme === 'light' ? 'black' : 'white' }}>
                <BackButton label={translate('overtime', language)} />

                <SearchInput
                    placeholder={translate('search_overtime', language)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    theme={theme}
                    openFilterPopup={openFilterPopup}
                />

                <div style={{ display: "flex", gap: "10px", marginTop: "10px", marginBottom: "20px", overflow: "auto", width: "100%" }}>
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

                {(!isLoading && filteredData.length === 0 && (selectedStatus.length > 0 || selectedType.length > 0 || searchQuery)) &&
                    <NoData image={ImageNotFound} title={translate('not_found', language)} />
                }

                {(!isLoading && filteredData.length === 0 && (selectedStatus.length === 0 && selectedType.length === 0 && !searchQuery)) &&
                    <NoData image={ImageNoData} title={translate('no_data_overtime', language)} />
                }

                {(!isLoading && filteredData.length > 0) &&
                    filteredData.map((item, index) => {
                        if (index === filteredData.length - 1) {
                            return (
                                <div key={item.id || `item-${index}`} ref={lastItemRef}>
                                    <CardOvertime item={item} index={index} openCancelPopup={openCancelPopup} optionTypes={optionTypes} />
                                </div>
                            );
                        } else {
                            return <CardOvertime key={item.id || `item-${index}`} item={item} index={index} openCancelPopup={openCancelPopup} optionTypes={optionTypes} />;
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
                    text={translate('submit_overtime', language)}
                    handleClick={handleLink}
                // disable
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
                onCancelSuccess={() => fetchOvertime(1, true)}
            />

            <FilterPopup
                isFilterPopup={isFilterPopup}
                closeFilterPopup={closeFilterPopup}
                applyFilter={applyFilter}
                theme={theme}
                language={language}
                popupTitle="Filter"
                filterSections={overtimeFilterSections}
                toggleSelection={toggleSelection}
            />
        </Page>
    );
};

export default OvertimePage;