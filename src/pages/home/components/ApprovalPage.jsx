import { f7, Page, Button } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import BackToHomeButton from '../../../components/backToHomeButton'
import { API } from '../../../api/axios'
import { useEffect, useState, useRef, useCallback } from 'react'
import CardIdle from './cardIdle'
import Loading from '../../../components/loading'
import { selectLanguages } from '../../../slices/languagesSlice'
import { translate } from '../../../utils/translate'
import { setActiveTab } from '../../../slices/tabSlice'
import { BiSearchAlt } from 'react-icons/bi'
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2'
import { IoIosClose } from "react-icons/io"
import NoData from '../../../components/noData'
import ImageNoData from "../../../assets/error/no-data.svg"
import ImageNotFound from "../../../assets/error/not-found.svg"
import { labelFilter } from '../../../functions/labelFilter'
import { formatPeriodLabel } from '../../../functions/formatPeriodLabel'
import FilterApprovalPopup from './filterPopup'
import FilterPopup from '../../../components/filterPopup'
import { getStatusOptions, getTypeOptions } from '../../../utils/selectOptions'
import SearchInput from '../../../components/searchInput'
import LoadingMoreAnimation from '../../../components/loadingMoreAnimation'

const ApprovalPage = () => {
  const theme = useSelector(selectSettings)
  const language = useSelector(selectLanguages)
  const dispatch = useDispatch()

  const [dataRequest, setDataRequest] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [isFilterPopup, setIsFilterPopup] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState([])
  const [selectedType, setSelectedType] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [tempSelectedStatus, setTempSelectedStatus] = useState([])
  const [tempSelectedType, setTempSelectedType] = useState([])
  const [tempSelectedPeriod, setTempSelectedPeriod] = useState(null)

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [allDataLoaded, setAllDataLoaded] = useState(false)
  const [scrollDebounceTimer, setScrollDebounceTimer] = useState(null)
  const observer = useRef()
  const listRef = useRef()
  const ITEMS_PER_PAGE = 10

  const lastElementRef = useCallback(node => {
    if (loadingMore || allDataLoaded) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !allDataLoaded) {
        console.log("Last element is visible, scheduling data load after delay...")

        if (scrollDebounceTimer) {
          clearTimeout(scrollDebounceTimer)
        }

        setLoadingMore(true)
        const timer = setTimeout(() => {
          if (page < totalPages) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchAllRequest(nextPage, false)
          } else {
            console.log("All pages loaded. No more data to fetch.")
            setAllDataLoaded(true)
          }
        }, 700)

        setScrollDebounceTimer(timer)
      }
    }, { threshold: 0.1 })

    if (node) observer.current.observe(node)
  }, [hasMore, loadingMore, page, totalPages, allDataLoaded, scrollDebounceTimer])

  const approvalFilterSections = [
    {
      type: 'buttons',
      label: translate('type_request', language),
      data: getTypeOptions(language),
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
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
      if (scrollDebounceTimer) {
        clearTimeout(scrollDebounceTimer)
      }
    }
  }, [scrollDebounceTimer])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery])

  const fetchAllRequest = async (pageNumber = 1, isNewRequest = false, statusFilter = selectedStatus, typeFilter = selectedType, periodeFilter = selectedPeriod) => {
    if (isLoading || loadingMore) return

    try {
      setIsLoading(isNewRequest)
      setLoadingMore(!isNewRequest)

      const conditionParams = {}

      if (debouncedSearchQuery) {
        conditionParams["name[like]"] = `%${debouncedSearchQuery}%`
      }

      if (statusFilter.length > 0) {
        conditionParams["status[in]"] = statusFilter.join(',')
      }

      if (typeFilter.length > 0) {
        conditionParams["type[in]"] = typeFilter.join(',')
      }

      if (periodeFilter) {
        conditionParams["created_at[month]"] = periodeFilter
      }

      console.log('Condition Params:', conditionParams)

      const response = await API.get("/mobile/form-request-all", {
        params: {
          page: pageNumber,
          sort_by: "created_at desc",
          limit: ITEMS_PER_PAGE,
          ...(Object.keys(conditionParams).length > 0 && { cond: JSON.stringify(conditionParams) })
        },
        paramsSerializer: params => {
          return new URLSearchParams(params).toString()
        }
      })


      const responseData = response.data.payload
      console.log("data fetch :", responseData);
      const pagination = response.data.pagination

      console.log('Response Data:', responseData)

      if (isNewRequest) {
        setDataRequest(responseData)
        setHasMore(pagination.total_page > 1)
        setTotalPages(pagination.total_page)
      } else {
        setDataRequest(prevData => {
          const combinedData = [...prevData, ...responseData]
          const uniqueData = Array.from(
            new Map(combinedData.map(item => [item.id, item])).values()
          )
          return uniqueData
        })
      }

      if (pageNumber >= pagination.total_page) {
        setHasMore(false)
        setAllDataLoaded(true)
      }

    } catch (error) {
      console.log("Error fetching approval data:", error)
      setHasMore(false)
      setAllDataLoaded(true)
    } finally {
      setIsLoading(false)
      setLoadingMore(false)
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
      })

      console.log("response options :", response.data.payload)
      setLeaveTypes(response.data.payload)
    } catch (error) {
      console.log("Data options tidak bisa diakses", error)
    }
  }

  useEffect(() => {
    if (leaveTypes.length === 0) {
      fetchOptions()
    }
    fetchAllRequest(1, true)
  }, [])

  useEffect(() => {
    console.log("Fetching data with updated filters...")
    setPage(1)
    setHasMore(true)
    setAllDataLoaded(false)
    fetchAllRequest(1, true)
  }, [debouncedSearchQuery, selectedStatus, selectedType, selectedPeriod])

  const onRefresh = (done) => {
    setTimeout(() => {
      setIsLoading(true)
      Promise.all([
        resetPaginationState(),
        fetchAllRequest(1, true),
        fetchOptions()
      ]).finally(() => {
        setIsLoading(false)
        done()
      })
    }, 500)
  }

  const resetPaginationState = () => {
    setPage(1)
    setHasMore(true)
    setAllDataLoaded(false)
    setLoadingMore(false)
  }

  const onPageBeforeIn = () => {
    setPage(1)
    setHasMore(true)
    setAllDataLoaded(false)
    fetchAllRequest(1, true)
  }

  const hitRead = async (id) => {
    try {
      const response = await API.put(`/notification/${id}`, {})
      console.log("response hittread:", response.data)
    } catch (error) {
      console.log("Data news tidak bisa diakses", error)
    }
  }

  const handleLinkRequest = (id, type, item) => {
    const notifNumbers = JSON.parse(localStorage.getItem('notificationData')) || []
    const matchedNotif = notifNumbers.find(item => item.idContent === id)
    console.log("id handleLinkRequest :", id)
    console.log("notifNumbers :", notifNumbers)
    console.log("matchedNotif :", matchedNotif)

    if (matchedNotif) {
      hitRead(matchedNotif.idNotif)
      console.log(`Found matching notification: idContent=${id}, idNotif=${matchedNotif.idNotif}`)
    } else {
      hitRead(id)
      console.log(`No matching notification found for idContent=${id}, using original id`)
    }

    dispatch(setActiveTab('view-home'))
    if (type == "overtime") {
      localStorage.setItem("overtime_data", JSON.stringify(item))
      f7.views.main.router.navigate(`/overtime-detail/${id}/`)
    } else {
      f7.views.main.router.navigate(`/notifications-detail/${id}/${type}/home/`)
    }
  }

  const openFilterPopup = () => setIsFilterPopup(true)
  const closeFilterPopup = () => setIsFilterPopup(false)

  const applyFilter = () => {
    setSelectedStatus([...tempSelectedStatus])
    setSelectedType([...tempSelectedType])
    setSelectedPeriod(tempSelectedPeriod)
    setIsFilterPopup(false)

    setPage(1)
    setDataRequest([])
    setHasMore(true)
    setAllDataLoaded(false)

    fetchAllRequest(1, true, tempSelectedStatus, tempSelectedType, tempSelectedPeriod)
  }

  useEffect(() => {
    if (isFilterPopup) {
      setTempSelectedStatus(selectedStatus)
      setTempSelectedType(selectedType)
      setTempSelectedPeriod(selectedPeriod)
    }
  }, [isFilterPopup])

  const toggleSelection = (value, selectedValues, setSelectedValues) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(item => item !== value))
    } else {
      setSelectedValues([...selectedValues, value])
    }
  }

  useEffect(() => {
    let filtered = dataRequest;

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus.length > 0) {
      filtered = filtered.filter(item => selectedStatus.includes(item.status));
    }

    if (selectedType.length > 0) {
      filtered = filtered.filter(item => selectedType.includes(item.type));
    }

    setFilteredData(filtered);
  }, [searchQuery, selectedStatus, selectedType, dataRequest]);

  return (
    <Page
      style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
      ptr
      ptrMousewheel={true}
      onPtrRefresh={onRefresh}
      onPageBeforeIn={onPageBeforeIn}
    >
      <div ref={listRef} style={{ padding: "15px", marginBottom: "20px", color: theme == "light" ? "black" : "white" }}>
        <BackToHomeButton label="Approval" />

        {/*<div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px", marginTop: "20px" }}>
          <div style={{
            width: "85%",
            display: "flex",
            color: "var(--bg-primary-green)",
            gap: "10px",
            alignItems: "center",
            border: theme === "light" ? "1px solid var(--border-primary-gray)" : "1px solid #363636",
            padding: "10px 15px",
            borderRadius: "8px"
          }}>
            <BiSearchAlt size={"16px"} />
            <input
              type="text"
              id="search"
              placeholder={translate('search_request', language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                fontSize: "var(--font-sm)",
                color: theme === "light" ? "black" : "white",
                border: "none",
                outline: "none",
                backgroundColor: "transparent"
              }}
            />
          </div>

          <Button onClick={openFilterPopup}>
            <HiOutlineAdjustmentsHorizontal size={"24px"} />
          </Button>
        </div>*/}
        <SearchInput
          placeholder={translate('search_request', language)}
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
                  setSelectedStatus(prev => {
                    const updatedStatus = prev.filter(item => item !== filter)
                    setTempSelectedStatus(updatedStatus)
                    return updatedStatus
                  })
                } else if (selectedType.includes(filter)) {
                  setSelectedType(prev => {
                    const updatedType = prev.filter(item => item !== filter)
                    setTempSelectedType(updatedType)
                    return updatedType
                  })
                } else if (filter === selectedPeriod) {
                  setSelectedPeriod(null)
                  setTempSelectedPeriod(null)
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
          <NoData image={ImageNoData} title={translate('reimburse_data_not_found', language)} />
        }

        <div style={{ marginTop: "20px" }}>
          {(!isLoading && filteredData.length > 0 && leaveTypes.length > 0) &&
            filteredData.map((item, index) => {
              if (index === filteredData.length - 1) {
                return (
                  <div key={item.id || `item-${index}`} ref={lastElementRef}>
                    <CardIdle item={item} handleLink={handleLinkRequest} leaveTypes={leaveTypes} />
                  </div>
                )
              } else {
                return <CardIdle key={item.id || `item-${index}`} item={item} handleLink={handleLinkRequest} leaveTypes={leaveTypes} />
              }
            })
          }
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
        popupTitle="Filter"
        filterSections={approvalFilterSections}
        toggleSelection={toggleSelection}
      />
    </Page>
  )
}

export default ApprovalPage