export const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) return 0;
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
};
