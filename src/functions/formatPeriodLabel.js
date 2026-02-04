export const formatPeriodLabel = (period, language) => {
    if (!period) return '';

    const [year, month] = period.split('-');
    const monthNames = {
        'en': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        'id': ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    };

    const monthName = monthNames[language] || monthNames['en'];
    return `${monthName[parseInt(month) - 1]} ${year}`;
};