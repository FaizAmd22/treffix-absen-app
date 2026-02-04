export const normalizeToYMD = (raw) => {
    if (!raw) return "";
    let s = String(raw).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    s = s.replace(/[./]/g, "-").replace(/\s+/g, " ").toLowerCase();

    const monthMap = {
        jan: 1, january: 1, januari: 1,
        feb: 2, february: 2, februari: 2,
        mar: 3, march: 3, maret: 3,
        apr: 4, april: 4,
        may: 5, mei: 5,
        jun: 6, june: 6, juni: 6,
        jul: 7, july: 7, juli: 7,
        aug: 8, august: 8, ags: 8, agustus: 8, agu: 8,
        sep: 9, september: 9,
        oct: 10, october: 10, okt: 10, oktober: 10,
        nov: 11, november: 11,
        dec: 12, december: 12, des: 12, desember: 12,
    };

    let m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (m) {
        const [_, dd, mm, yyyy] = m;
        const d = dd.padStart(2, "0");
        const m2 = mm.padStart(2, "0");
        return `${yyyy}-${m2}-${d}`;
    }

    m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) {
        const [_, yyyy, mm, dd] = m;
        const d = dd.padStart(2, "0");
        const m2 = mm.padStart(2, "0");
        return `${yyyy}-${m2}-${d}`;
    }

    m = s.match(/^(\d{1,2})[\s-]([a-zA-Z]+)[\s-](\d{4})$/);
    if (m) {
        const [_, dd, mon, yyyy] = m;
        const mmNum = monthMap[mon] || monthMap[mon.slice(0, 3)];
        if (mmNum) {
            const d = String(dd).padStart(2, "0");
            const m2 = String(mmNum).padStart(2, "0");
            return `${yyyy}-${m2}-${d}`;
        }
    }

    const dt = new Date(s);
    if (!Number.isNaN(dt.getTime())) {
        const yyyy = String(dt.getFullYear());
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    return "";
};