export const formatDate = (date, language, type) => {
    let options = {};

    if (type === "with-weekdays") {
        options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    } else if (type === "month-year") {
        options = { year: 'numeric', month: 'long' };
    } else if (type === "with-time") {
        options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    } else {
        options = { year: 'numeric', month: 'long', day: 'numeric' };
    }

    const times = new Date(date);

    if (type === "with-time") {
        return times.toLocaleString(language === 'id' ? 'id-ID' : 'en-EN', options);
    } else {
        return times.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-EN', options);
    }
};

export const formatDateCard = (date, language, type) => {
    let options = {};

    if (type === "with-weekdays") {
        options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    } else if (type === "month-year") {
        options = { year: 'numeric', month: 'short' };
    } else if (type === "with-time") {
        options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    } else {
        options = { year: 'numeric', month: 'short', day: 'numeric' };
    }

    const times = new Date(date);

    if (type === "with-time") {
        return times.toLocaleString(language === 'id' ? 'id-ID' : 'en-EN', options);
    } else {
        return times.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-EN', options);
    }
};