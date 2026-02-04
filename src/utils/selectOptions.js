import { translate } from "./translate";

export const religionOptions = [
    {
        label: "Islam",
        value: "islam",
    },
    {
        label: "Kristen",
        value: "kristen",
    },
    {
        label: "Katolik",
        value: "katolik",
    },
    {
        label: "Hindu",
        value: "hindu",
    },
    {
        label: "Buddha",
        value: "buddha",
    },
    {
        label: "Konghucu",
        value: "konghucu",
    },
];

export const bloodTypeOptions = [
    {
        label: "A",
        value: "A",
    },
    {
        label: "B",
        value: "B",
    },
    {
        label: "AB",
        value: "AB",
    },
    {
        label: "O",
        value: "O",
    },
    {
        label: "-",
        value: "-",
    },
];

export const maritalStatusOptions = [
    {
        label: "Belum Menikah",
        value: "single",
    },
    {
        label: "Menikah",
        value: "married",
    },
    {
        label: "Cerai",
        value: "divorced",
    },
];

export const genderOptions = [
    {
        label: "Laki-laki",
        value: "L",
    },
    {
        label: "Perempuan",
        value: "P",
    },
];

export const hasChildOptions = [
    {
        label: "Ya, Sudah",
        value: "yes",
    },
    {
        label: "Belum Memiliki Anak",
        value: "no",
    },
];

export const educationLevelOptions = [
    { label: "SD", value: "SD" },
    { label: "SMP", value: "SMP" },
    { label: "SMA", value: "SMA" },
    { label: "Diploma 1 (D1)", value: "D1" },
    { label: "Diploma 2 (D2)", value: "D2" },
    { label: "Diploma 3 (D3)", value: "D3" },
    { label: "Diploma 4 (D4)", value: "D4" },
    { label: "Sarjana (S1)", value: "S1" },
    { label: "Magister (S2)", value: "S2" },
    { label: "Doktor (S3)", value: "S3" },
];

export const trainingStatusOptions = [
    { value: "wajib", label: "Wajib" },
    { value: "tidak wajib", label: "TIdak Wajib" },
];

export const trainingMethodOptions = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
];

export const trainingFormatOptions = [
    { value: "single", label: "Development Sekali" },
    { value: "group", label: "Development Berkala" }
];

export const getTypeOptions = (language) => [
    { value: "leave", label: translate('attendance_permission', language) },
    { value: "overtime", label: translate('overtime', language) },
    { value: "reimbursement", label: "Reimbursement" },
    { value: "procurement", label: translate('home_assets', language) }
];

export const getStatusOptions = (language) => [
    { value: "approved", label: translate('approved', language) },
    { value: "rejected", label: translate('rejected', language) },
    { value: "idle", label: translate('waiting_approval', language) },
    { value: "canceled", label: translate('canceled', language) }
];

export const getActivityOptions = (language) => [
    { value: "plus", label: translate('increased', language) },
    { value: "minus", label: translate('decreased', language) }
];

export const getProcurementTypeOptions = () => [
    { value: "elektronik", label: "Elektronik" },
    { value: "alat kantor", label: "Alat Kantor" },
    { value: "kendaraan", label: "Kendaraan" }
];