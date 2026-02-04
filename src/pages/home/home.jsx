import React, { useEffect, useState } from 'react';
import { Block, Page } from 'framework7-react';
import TextureBg from "../../assets/bg-texture.svg";
import Dashboard from './components/dashboard';
import HomeProfile from './components/homeProfile';
import { API } from '../../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../slices/userSlice';
import { selectSettings } from '../../slices/settingsSlice';
import { createReminder } from '../../functions/notification';

const HomePage = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectSettings)
  const currentDate = new Date(Date.now())
  const formattedDate = currentDate.toISOString().slice(0, 7);
  const token = localStorage.getItem("token")
  const [dataUser, setDataUser] = useState(null)
  const [isRefresh, setIsRefresh] = useState(false)

  console.log("dataUser :", dataUser);

  const parseTimeWithUTCOffset = (timeString, baseDate) => {
    let timeOnly = timeString;
    if (timeString.includes('+')) {
      timeOnly = timeString.split('+')[0];
    }

    const [hours, minutes, seconds] = timeOnly.split(':').map(Number);

    const date = new Date(baseDate);

    const getLocalTimezoneOffset = () => {
      return new Date().getTimezoneOffset() / -60;
    };

    const UTC_TO_LOCAL_OFFSET = getLocalTimezoneOffset();

    date.setHours(hours + UTC_TO_LOCAL_OFFSET, minutes, seconds || 0, 0);

    return date;
  };

  const scheduleReminders = (shiftsData, userData) => {
    const isReminderAttendance = localStorage.getItem('reminderAttendance')
    console.log("isReminderAttendance di home :", isReminderAttendance);
    if (!isReminderAttendance || isReminderAttendance === "false") {
      console.log("Reminder dinonaktifkan");
      return;
    }

    if (!shiftsData || !shiftsData.length || !userData || !userData.email) {
      console.log("Data shift atau user tidak tersedia untuk pengingat");
      return;
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    console.log("Scheduling reminders for today:", todayStr);

    shiftsData.forEach((shift) => {
      const shiftDateObj = new Date(shift.shift_date);
      const shiftDateStr = shiftDateObj.toISOString().slice(0, 10);

      console.log(`Checking shift: ${shift.shift_name} on ${shiftDateStr}`);

      if (shiftDateStr === todayStr) {
        const startTime = parseTimeWithUTCOffset(shift.start_time, now);
        const endTime = parseTimeWithUTCOffset(shift.end_time, now);

        console.log("reminderStart :", new Date(startTime.getTime() - 10 * 60 * 1000));
        console.log("reminderEnd :", new Date(endTime.getTime() - 10 * 60 * 1000));

        const reminderStart = new Date(startTime.getTime() - 10 * 60 * 1000);
        const reminderEnd = new Date(endTime.getTime() - 10 * 60 * 1000);
        const currentTime = Date.now();

        const delayStart = reminderStart.getTime() - currentTime;
        if (delayStart > 0) {
          console.log(`Reminder masuk akan muncul dalam ${delayStart / 60000} menit`);
          setTimeout(() => {
            createReminder(
              "Pastikan Anda melakukan absen masuk hari ini!",
              Date.now(),
              {
                email: userData.email,
                title: `Reminder absen masuk - ${shift.shift_name}`,
              }
            );
          }, delayStart);
        } else {
          console.log("Waktu reminder masuk sudah lewat");
        }

        const delayEnd = reminderEnd.getTime() - currentTime;
        if (delayEnd > 0) {
          console.log(`Reminder keluar akan muncul dalam ${delayEnd / 60000} menit`);
          setTimeout(() => {
            createReminder(
              "Pastikan Anda melakukan absen keluar hari ini!",
              Date.now(),
              {
                email: userData.email,
                title: `Reminder absen keluar - ${shift.shift_name}`,
              }
            );
          }, delayEnd);
        } else {
          console.log("Waktu reminder keluar sudah lewat");
        }
      }
    });
  };

  const fetchSchedule = async (userId) => {
    try {
      console.log("Fetching schedules for user ID:", userId);

      const response = await API.get('/employee-shifts/calendar', {
        params: {
          user_id: userId,
          date: formattedDate,
        }
      });

      const data = response.data.payload.shifts;
      if (dataUser) {
        scheduleReminders(data, dataUser);
      }

      return data;
    } catch (error) {
      console.error("Error fetching schedule data:", error);
      return [];
    }
  };

  const fetchUser = async () => {
    try {
      const response = await API.get("/mobile/auth/me");

      const userData = response.data.payload;
      dispatch(updateUser(userData));
      setDataUser(userData);
      // await fetchSchedule(userData.id);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, []);

  const onRefresh = (done) => {
    setIsRefresh(true);
    setTimeout(() => {
      setIsRefresh(false);
      done();
    }, 300);
  }

  return (
    <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
      <Block style={{ background: theme === "light" ? "var(--bg-primary-black)" : "linear-gradient(#33a59d, #0f7a84)", margin: 0, padding: 0, marginBottom: "-10px" }}>
        <img src={TextureBg} alt="TextureBg" style={{ width: "100%", height: "290px", objectFit: "cover", position: "fixed", opacity: "20%" }} />

        <HomeProfile />

        <Dashboard isRefresh={isRefresh} />
      </Block>
    </Page>
  );
}

export default HomePage;