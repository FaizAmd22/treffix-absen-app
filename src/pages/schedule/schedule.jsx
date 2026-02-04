import { Page, List, ListItem, Button, f7, Fab, Icon } from 'framework7-react'
import React, { useState, useEffect } from 'react'
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { useSelector } from 'react-redux';
import { selectSettings } from '../../slices/settingsSlice';
import { API } from '../../api/axios';
import { selectUser } from '../../slices/userSlice';
import { selectLanguages } from '../../slices/languagesSlice';
import { translate } from '../../utils/translate';
import { getTranslatedMonths } from '../../functions/getTranslatedMonths';
import Loading from '../../components/loading';
import { getScheduleTypeColor } from './functions/getScheduleTypeColor';
import AddScheduleIcon from '../../icons/addSchedule';

const SchedulePage = () => {
    const [currentDate, setCurrentDate] = useState(new Date(Date.now()));
    const [scheduleData, setScheduleData] = useState([]);
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const getUser = useSelector(selectUser)
    const token = localStorage.getItem("token")
    const [isLoading, setIsLoading] = useState(true)

    const days = [
        translate('monday', language),
        translate('tuesday', language),
        translate('wednesday', language),
        translate('thursday', language),
        translate('friday', language),
        translate('saturday', language),
        translate('sunday', language)
    ];

    const months = getTranslatedMonths(language)

    const getMonthDateRange = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const startDate = new Date(year, month, 1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(year, month + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        return {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        };
    };

    const fetchScheduleData = async () => {
        try {
            setIsLoading(true);
            localStorage.removeItem('addScheduleDate')
            const { start_date, end_date } = getMonthDateRange(currentDate);
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';

            const response = await API.get('/user-schedules', {
                params: {
                    start_date: start_date,
                    end_date: end_date,
                    timezone: timezone
                }
            });

            console.log("data fetch schedule :", response.data);

            if (response.data.status === 200 && response.data.payload && response.data.payload.length > 0) {
                setScheduleData(response.data.payload);
            } else {
                setScheduleData([]);
            }
        } catch (error) {
            console.error('Error fetching schedule data:', error);
            setScheduleData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (dateTimeString) {
            const date = new Date(dateTimeString);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } else {
            return null;
        }
    };

    useEffect(() => {
        if (getUser.id) {
            fetchScheduleData();
        }
    }, [currentDate, getUser.id]);

    const onRefresh = (done) => {
        fetchScheduleData();
        setTimeout(() => {
            done();
        }, 500);
    };

    const handleCardOpen = (data) => {
        localStorage.setItem('scheduleData', JSON.stringify(data))
        f7.views.main.router.navigate("/card-schedule-detail/")
    }

    const handleDateClick = (day) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');

        const formattedDate = `${year}-${month}-${dayStr}`;

        console.log("Navigating to date:", formattedDate);
        console.log("Current month:", currentDate.getMonth() + 1, "Day:", day);

        f7.views.main.router.navigate(`/schedule-detail/${formattedDate}/`);
    }

    const handlePrevMonth = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(prevDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(prevDate.getMonth() + 1);
            return newDate;
        });
    };

    const onPageBeforeIn = () => {
        fetchScheduleData();
    };

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} onPageBeforeIn={onPageBeforeIn} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <div style={{ margin: 0, color: theme === "light" ? "black" : "white", padding: "15px 10px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <Button onClick={handlePrevMonth}>
                        <MdNavigateBefore size={"20px"} color="var(--bg-primary-green)" />
                    </Button>

                    <p style={{ fontWeight: "700", fontSize: "var(--font-lg)" }}>
                        {`${months[currentDate.getMonth()].slice(0, 3)} ${currentDate.getFullYear()}`}
                    </p>

                    <Button onClick={handleNextMonth}>
                        <MdNavigateNext size={"20px"} color="var(--bg-primary-green)" />
                    </Button>
                </div>

                {isLoading && <Loading height="80vh" />}

                {!isLoading && (
                    <div style={{ marginTop: "20px" }}>
                        {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                            const day = i + 1;
                            const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
                            const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                            const formattedDay = `${days[adjustedDayOfWeek].slice(0, 3)}, ${day}`;

                            const daySchedules = scheduleData.filter(schedule => {
                                const scheduleDate = new Date(schedule.start_date);
                                const compareDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                return scheduleDate.toLocaleDateString() === compareDate.toLocaleDateString();
                            });

                            return (
                                <div
                                    key={day}
                                    style={{ display: "flex", padding: "0 15px", cursor: "pointer" }}
                                    onClick={daySchedules.length === 1 ? undefined : () => handleDateClick(day)}
                                >
                                    <p style={{
                                        width: "25%",
                                        height: "40px",
                                        fontSize: "var(--font-sm)",
                                        borderTop: "1px solid var(--border-primary-gray)",
                                        marginTop: 0,
                                        paddingTop: "10px",
                                        color: theme === "light" ? "black" : "white"
                                    }}>
                                        {formattedDay}
                                    </p>

                                    {daySchedules.length > 0 ? (
                                        <div style={{
                                            width: "75%",
                                            minHeight: "78px",
                                            margin: 0,
                                            border: "1px solid var(--border-primary-gray)",
                                            borderBottom: "none",
                                            display: "flex",
                                            overflowX: "auto",
                                            gap: "15px",
                                            padding: "10px"
                                        }}>
                                            {daySchedules.map((userSchedule, index) => {
                                                const colors = getScheduleTypeColor(userSchedule.schedule_type);
                                                const startTime = formatDateTime(userSchedule.start_date);
                                                const endTime = formatDateTime(userSchedule.end_date);

                                                const onClickHandler = daySchedules.length === 1
                                                    ? () => handleCardOpen(userSchedule)
                                                    : () => handleDateClick(day);

                                                return (
                                                    <div onClick={onClickHandler} key={index}>
                                                        <div style={{
                                                            width: "200px",
                                                            height: "100%",
                                                            borderRadius: "5px",
                                                            display: "flex",
                                                            background: colors.background
                                                        }}>
                                                            <div style={{
                                                                background: colors.border,
                                                                width: "8px",
                                                                height: "100%",
                                                                borderRadius: "50px 0 0 50px"
                                                            }} />

                                                            <div style={{ padding: "10px 20px", width: "100%", color: theme == "light" ? "black" : "white" }}>
                                                                <p style={{
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: "var(--font-lg)",
                                                                    fontWeight: "700",
                                                                    marginBottom: "5px"
                                                                }}>
                                                                    {userSchedule.event_name.length > 14
                                                                        ? userSchedule.event_name.slice(0, 14) + ".."
                                                                        : userSchedule.event_name}
                                                                </p>
                                                                <p style={{
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: "var(--font-md)",
                                                                    fontWeight: "400",
                                                                    color: theme == "light" ? "#666" : "white"
                                                                }}>
                                                                    {startTime + (!endTime ? "" : ` - ${endTime}`)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: "75%",
                                            height: "78px",
                                            margin: 0,
                                            border: "1px solid var(--border-primary-gray)",
                                            borderBottom: "none",
                                            padding: "10px"
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Fab
                position="right-bottom"
                slot="fixed"
                onClick={() => f7.views.main.router.navigate('/add-schedule/')}
            >
                <div style={{ width: "100%", height: "100%", background: "var(--bg-primary-green)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <AddScheduleIcon fillColor='white' width={32} height={32} />
                </div>
            </Fab>
        </Page>
    );
};

export default SchedulePage;