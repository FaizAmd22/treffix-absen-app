export const getRelativeTime = (dateString, language = 'id') => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
        { unit: 'year', seconds: 31536000 },
        { unit: 'month', seconds: 2592000 },
        { unit: 'week', seconds: 604800 },
        { unit: 'day', seconds: 86400 },
        { unit: 'hour', seconds: 3600 },
        { unit: 'minute', seconds: 60 }
    ];

    const translations = {
        id: {
            now: 'baru saja',
            second: (n) => `${n} detik yang lalu`,
            minute: (n) => `${n} menit yang lalu`,
            hour: (n) => `${n} jam yang lalu`,
            day: (n) => n === 1 ? 'kemarin' : `${n} hari yang lalu`,
            week: (n) => `${n} minggu yang lalu`,
            month: (n) => `${n} bulan yang lalu`,
            year: (n) => `${n} tahun yang lalu`
        },
        en: {
            now: 'just now',
            second: (n) => `${n} second${n !== 1 ? 's' : ''} ago`,
            minute: (n) => `${n} minute${n !== 1 ? 's' : ''} ago`,
            hour: (n) => `${n} hour${n !== 1 ? 's' : ''} ago`,
            day: (n) => n === 1 ? 'yesterday' : `${n} day${n !== 1 ? 's' : ''} ago`,
            week: (n) => `${n} week${n !== 1 ? 's' : ''} ago`,
            month: (n) => `${n} month${n !== 1 ? 's' : ''} ago`,
            year: (n) => `${n} year${n !== 1 ? 's' : ''} ago`
        }
    };

    const t = translations[language] || translations.en;

    if (seconds < 5) return t.now;
    if (seconds < 60) return t.second(Math.floor(seconds));

    for (const { unit, seconds: secondsInUnit } of intervals) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return t[unit](interval);
        }
    }

    return formatDate(dateString, language, "short");
};