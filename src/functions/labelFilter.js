import { translate } from "../utils/translate"

export const labelFilter = (filter, language) => {
    if (filter == "attendance") {
        return translate('attendance', language)
    } else if (filter == "development") {
        return translate('development', language)
    } else if (filter == "development_present") {
        return "Development Present"
    } else if (filter == "performance") {
        return translate('performance', language)
    } else if (filter == "plus") {
        return translate('increased', language)
    } else if (filter == "minus") {
        return translate('decreased', language)
    } else if (filter == "approved") {
        return translate('approved', language)
    } else if (filter == "rejected") {
        return translate('rejected', language)
    } else if (filter == "idle") {
        return translate('waiting_approval', language)
    } else if (filter == "canceled") {
        return translate('canceled', language)
    } else if (filter == "single") {
        return "Development Sekali"
    } else if (filter == "group") {
        return "Development Berkala"
    } else if (filter === true) {
        return "Wajib"
    } else if (filter === false) {
        return "Tidak Wajib"
    } else if (filter === "attendance_ontime") {
        return translate('attendance_ontime', language)
    } else if (filter === "attendance_late") {
        return translate('attendance_late', language)
    } else if (filter === "once") {
        return translate('once', language)
    } else if (filter === "daily") {
        return translate('daily', language)
    } else if (filter === "weekly") {
        return translate('weekly', language)
    } else if (filter === "monthly") {
        return translate('monthly', language)
    } else if (filter == "working_hour") {
        return translate('working_hour', language)
    } else {
        return filter
    }
}