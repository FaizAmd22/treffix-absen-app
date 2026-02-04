// src/utils/ttl.js

/**
 * Ubah "21-12-1990" / "21/12/1990" / "21.12.1990" -> "1990-12-21"
 * Toleran juga ke "1990-12-21" (return apa adanya).
 */
export const normalizeOcrDate = (input) => {
    if (!input) return "";
    const raw = String(input).trim();

    // Sudah format YYYY-MM-DD?
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    // Samakan delimiter jadi "-"
    const cleaned = raw.replace(/[/.]/g, "-");

    const ddmmyyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;   // 21-12-1990
    const yyyymmdd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;   // 1990-12-21

    if (ddmmyyyy.test(cleaned)) {
        const [, dStr, mStr, yStr] = cleaned.match(ddmmyyyy);
        const dd = dStr.padStart(2, "0");
        const mm = mStr.padStart(2, "0");
        const yyyy = yStr;

        const dNum = Number(dd);
        const mNum = Number(mm);
        if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
            return `${yyyy}-${mm}-${dd}`;
        }
    }

    if (yyyymmdd.test(cleaned)) {
        const [, yStr, mStr, dStr] = cleaned.match(yyyymmdd);
        const yyyy = yStr;
        const mm = mStr.padStart(2, "0");
        const dd = dStr.padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    // Fallback: coba Date parsing ringan
    const dt = new Date(raw);
    if (!Number.isNaN(dt.getTime())) {
        const yyyy = String(dt.getFullYear());
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    return "";
};

/**
 * Parse TTL "JAKARTA, 21-12-1990" -> { place: "JAKARTA", dateIso: "1990-12-21" }
 */
export const parseTTL = (ttl) => {
    if (!ttl) return { place: "", dateIso: "" };
    const parts = String(ttl).split(","); // pisah ke 2 bagian
    const placeRaw = (parts[0] || "").trim();
    const dateRaw = (parts[1] || "").trim();

    return {
        place: placeRaw,
        dateIso: normalizeOcrDate(dateRaw),
    };
};
