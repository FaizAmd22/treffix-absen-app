import { f7 } from 'framework7-react';
import { pushNotification } from './pushNotification';

// Konfigurasi
const STORAGE_KEY = 'f7ReminderSystem';
const CHECK_INTERVAL_MS = 10000;
let checkInterval = null;

// Inisialisasi sistem reminder
export function initReminderSystem() {
    if (!checkInterval) {
        checkInterval = setInterval(() => checkReminders(), CHECK_INTERVAL_MS);
        cleanupReminders();
    }

    // Tambahkan event listener untuk page:init agar reminder tetap berjalan di semua halaman
    f7.on('pageInit', () => {
        // Memastikan sistem reminder tetap berjalan saat navigasi halaman
        if (!checkInterval) {
            checkInterval = setInterval(() => checkReminders(), CHECK_INTERVAL_MS);
        }
    });
}

// Membuat reminder baru
export function createReminder(message, reminderTime, options = {}) {
    const reminders = getReminders();

    const newReminder = {
        id: Date.now().toString(),
        message: message,
        time: reminderTime,
        triggered: false,
        email: options.email || '',
        title: options.title || 'Reminder',
        image: options.image || null,
        ...options
    };

    reminders.push(newReminder);
    saveReminders(reminders);

    // Pastikan sistem reminder aktif
    if (!checkInterval) {
        initReminderSystem();
    }

    return newReminder.id;
}

// Mendapatkan semua reminder dari localStorage
export function getReminders() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
        console.error('Error parsing reminders', e);
        return [];
    }
}

// Menyimpan reminder ke localStorage
export function saveReminders(reminders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export function checkReminders() {
    const currentTime = Date.now();
    const reminders = getReminders();
    let updated = false;

    // console.log(`Checking ${reminders.length} reminders at ${new Date().toISOString()}`);

    reminders.forEach(reminder => {
        // Debugging
        const reminderTime = new Date(reminder.time).toLocaleString();
        // console.log(`Reminder: ${reminder.id}, Time: ${reminderTime}, Current: ${new Date(currentTime).toLocaleString()}, Triggered: ${reminder.triggered}`);

        if (currentTime >= reminder.time && !reminder.triggered) {
            console.log(`Triggering reminder: ${reminder.id}, Message: ${reminder.message}`);

            if (reminder.email) {
                // console.log(`Sending push notification to ${reminder.email}`);
                pushNotification({
                    email: reminder.email,
                    title: reminder.title || 'Reminder',
                    text: reminder.message,
                    image: reminder.image || undefined
                })
                    .then(result => {
                        console.log("Push notification result:", result);
                    })
                    .catch(err => {
                        console.error("Push notification error:", err);
                        // Fallback ke dialog jika push notification gagal
                        f7.dialog.alert(reminder.message, reminder.title || 'Reminder');
                    });
            } else {
                // Fallback ke dialog jika email tidak tersedia
                console.log("No email found, showing dialog instead");
                f7.dialog.alert(reminder.message, reminder.title || 'Reminder');
            }

            reminder.triggered = true;
            updated = true;
        }
    });

    if (updated) {
        // console.log("Saving updated reminders");
        saveReminders(reminders);
    }
}

// Menghapus reminder yang sudah ditampilkan
export function cleanupReminders() {
    const reminders = getReminders();
    const activeReminders = reminders.filter(reminder => !reminder.triggered);

    if (activeReminders.length !== reminders.length) {
        saveReminders(activeReminders);
    }
}

// Menghapus reminder berdasarkan ID
export function deleteReminder(id) {
    const reminders = getReminders();
    const filteredReminders = reminders.filter(reminder => reminder.id !== id);
    saveReminders(filteredReminders);
}

// Menghapus semua reminder
export function clearAllReminders() {
    saveReminders([]);
}

// Hentikan sistem reminder
export function destroyReminderSystem() {
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
    }
    f7.off('pageInit');
}

// Fungsi untuk membuat reminder pada waktu spesifik
export function createTimeSpecificReminder(message, hours, minutes, options = {}) {
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    // Jika waktu sudah lewat hari ini, set untuk besok
    if (targetTime.getTime() < Date.now()) {
        targetTime.setDate(targetTime.getDate() + 1);
    }

    return createReminder(message, targetTime.getTime(), options);
}