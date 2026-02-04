export const getScheduleTypeColor = (scheduleType) => {
    const colors = {
        interview: {
            background: "rgba(51, 114, 255, 0.25)",
            border: "rgb(51, 114, 255)"
        },
        custom: {
            background: "rgba(254, 154, 0, 0.25)",
            border: "rgb(254, 154, 0)"
        },
        working_hour: {
            background: "rgba(0, 211, 242, 0.25)",
            border: "rgb(0, 211, 242)"
        },
        development: {
            background: "rgba(154, 230, 0, 0.25)",
            border: "rgb(154, 230, 0)"
        }
    };
    return colors[scheduleType] || colors.custom;
};