import { API } from "../api/axios";

export const detectAccessDocKind = (contentType = "") => {
    const ct = String(contentType).toLowerCase();
    if (ct.includes("pdf")) return "pdf";
    if (ct.includes("image/")) return "image";
    return "image";
};

export const decryptAccessDoc = async (docId) => {
    if (!docId) throw new Error("docId is required");

    const res = await API.get("/mobile/employees/personal/access-doc", {
        params: { doc_id: docId },
        responseType: "blob",
    });

    const contentType =
        res?.headers?.["content-type"] || res?.headers?.["Content-Type"] || "";

    const kind = detectAccessDocKind(contentType);

    const blob = res.data;
    const url = URL.createObjectURL(blob);

    return { url, kind, contentType };
};

export const prefetchDecryptDocs = async (docs = [], onItem, options = {}) => {
    const {
        concurrency = 2,
        shouldSkip = () => false,
    } = options;

    const queue = [...docs];

    const worker = async () => {
        while (queue.length) {
            const item = queue.shift();
            const docId = item?.id;
            if (!docId) continue;
            if (shouldSkip(item)) continue;

            try {
                const result = await decryptAccessDoc(docId);
                onItem?.(docId, result, item);
            } catch (e) {
                console.error("[prefetchDecryptDocs] failed:", docId, e);
                onItem?.(docId, { error: e }, item);
            }
        }
    };

    await Promise.all(Array.from({ length: concurrency }, worker));
};
