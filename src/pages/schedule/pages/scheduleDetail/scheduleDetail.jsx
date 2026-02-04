import { Button, f7, Fab, Page } from 'framework7-react'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../../slices/settingsSlice'
import { selectUser } from '../../../../slices/userSlice'
import { selectLanguages } from '../../../../slices/languagesSlice'
import BackButton from '../../../../components/backButton'
import { API } from '../../../../api/axios'
import Loading from '../../../../components/loading'
import { getScheduleTypeColor } from '../../functions/getScheduleTypeColor'
import { formatDate } from '../../../../functions/formatDate'
import NoDataImage from '../../../../assets/error/no-data.svg'
import NoData from '../../../../components/noData'
import { labelFilter } from '../../../../functions/labelFilter'
import { translate } from '../../../../utils/translate'
import CustomButton from '../../../../components/customButton'
import AddScheduleIcon from '../../../../icons/addSchedule'

const ScheduleDetail = () => {
    const [scheduleData, setScheduleData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const theme = useSelector(selectSettings)
    const getUser = useSelector(selectUser)
    const language = useSelector(selectLanguages)
    const dates = f7.views.main.router.currentRoute.params.date

    const getMonthDateRange = (dateString) => {
        const targetDate = new Date(dateString)
        const year = targetDate.getFullYear()
        const month = targetDate.getMonth()

        const startDate = new Date(year, month, 1)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(year, month + 1, 0)
        endDate.setHours(23, 59, 59, 999)

        return {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        }
    }

    const fetchScheduleData = async () => {
        try {
            setIsLoading(true)
            const { date } = f7.views.main.router.currentRoute.params
            const { start_date, end_date } = getMonthDateRange(date)
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta'

            const response = await API.get('/user-schedules', {
                params: {
                    start_date: start_date,
                    end_date: end_date,
                    timezone: timezone
                }
            })

            console.log("Full schedule data:", response.data)

            if (response.data.status === 200 && response.data.payload && response.data.payload.length > 0) {
                const targetDate = new Date(date)
                const filteredData = response.data.payload.filter(schedule => {
                    const scheduleDate = new Date(schedule.start_date)
                    return scheduleDate.toLocaleDateString() === targetDate.toLocaleDateString()
                })

                console.log("Filtered schedule data for date:", date, filteredData)
                setScheduleData(filteredData)
            } else {
                setScheduleData([])
            }
        } catch (error) {
            console.error('Error fetching schedule data:', error)
            setScheduleData([])
        } finally {
            setIsLoading(false)
        }
    }

    const formatDateTime = (dateTimeString) => {
        if (dateTimeString) {
            const date = new Date(dateTimeString)
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }
        return null
    }

    useEffect(() => {
        const { date } = f7.views.main.router.currentRoute.params
        fetchScheduleData()
    }, [])

    const handleCardOpen = (data) => {
        localStorage.setItem('scheduleData', JSON.stringify(data))
        f7.views.main.router.navigate("/card-schedule-detail/")
    }

    const renderScheduleItem = (schedule, index) => {
        const colors = getScheduleTypeColor(schedule.schedule_type)
        const startTime = formatDateTime(schedule.start_date)
        const endTime = formatDateTime(schedule.end_date)

        return (
            <div onClick={() => handleCardOpen(schedule)} key={index} style={{
                marginBottom: '20px',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    background: colors.background,
                    minHeight: '80px'
                }}>
                    <div style={{
                        background: colors.border,
                        width: '8px',
                        minHeight: '100%'
                    }} />

                    <div style={{
                        padding: '15px 20px',
                        width: '100%',
                        color: theme == "light" ? "black" : "white"
                    }}>
                        <h3 style={{
                            margin: 0,
                            marginBottom: '8px',
                            fontSize: 'var(--font-lg)',
                            fontWeight: '700'
                        }}>
                            {schedule.event_name}
                        </h3>

                        <p style={{
                            margin: 0,
                            marginBottom: '5px',
                            fontSize: 'var(--font-md)',
                            color: theme == "light" ? "#666" : "white"
                        }}>
                            {startTime + (!endTime ? "" : ` - ${endTime}`)}
                        </p>

                        {schedule.description && (
                            <p style={{
                                margin: 0,
                                fontSize: 'var(--font-sm)',
                                color: theme == "light" ? "#888" : "white",
                                marginTop: '8px'
                            }}>
                                {schedule.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const handleAddSchedule = () => {
        localStorage.setItem('addScheduleDate', dates)
        f7.views.main.router.navigate('/add-schedule/')
    }

    const onRefresh = (done) => {
        fetchScheduleData();
        setTimeout(() => {
            done();
        }, 500);
    };

    const onPageBeforeIn = () => {
        fetchScheduleData();
    };

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} onPageBeforeIn={onPageBeforeIn} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <div style={{ padding: '15px', color: theme === "light" ? "black" : "white" }}>
                <BackButton label={`${translate('schedule_list', language)} - ${dates ? formatDate(dates, language, "with-weekdays") : ""}`} />

                {isLoading && <Loading height="50vh" />}

                {!isLoading && (
                    <div style={{ marginTop: "20px" }}>
                        {scheduleData.length > 0 ? (
                            <>
                                <div>
                                    {scheduleData.map((schedule, index) => renderScheduleItem(schedule, index))}
                                </div>

                                <Fab
                                    position="right-bottom"
                                    slot="fixed"
                                    onClick={handleAddSchedule}
                                >
                                    <div style={{ width: "100%", height: "100%", background: "var(--bg-primary-green)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <AddScheduleIcon fillColor='white' width={32} height={32} />
                                    </div>
                                </Fab>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <NoData image={NoDataImage} title={translate('havent_make_schedule', language)} message={translate('havent_make_schedule_text', language)} />

                                <CustomButton
                                    color={"white"}
                                    bg={"var(--bg-primary-green)"}
                                    text={translate('create_schedule_now', language)}
                                    handleClick={handleAddSchedule}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Page>
    )
}

export default ScheduleDetail