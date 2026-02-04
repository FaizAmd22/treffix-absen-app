// utils/dataUrlToFile.js

export function dataURLToBlobSafe(dataURL) {
    const [header, base64] = dataURL.split(',');
    const mime = (header.match(/data:([^;]+);/) || [])[1] || 'application/octet-stream';
    const binary = atob(base64 || '');
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
}

function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.9) {
    return new Promise((resolve) => {
        if (canvas.toBlob) canvas.toBlob((b) => resolve(b), type, quality);
        else resolve(dataURLToBlobSafe(canvas.toDataURL(type, quality)));
    });
}

export async function reencodeToJpegBlobSafe(dataURL, quality = 0.9) {
    const img = await new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = dataURL;
    });
    const c = document.createElement('canvas');
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await canvasToBlob(c, 'image/jpeg', quality);
    if (!blob) throw new Error('Failed to create JPEG blob');
    return blob;
}

function fileCtorReliable() {
    try {
        const b = new Blob(['x'], { type: 'text/plain' });
        const f = new File([b], 'a.txt', { type: 'text/plain' });
        return f && f.size === 1 && f.type === 'text/plain';
    } catch {
        return false;
    }
}

/**
 * Selalu kembalikan objek siap-upload:
 * - prefer Blob + filename (aman di Cordova)
 * - kalau File() benar2 reliable, boleh kembalikan file, tapi fallback kalau size==0
 */
export async function ensureJpegUploadable(dataURL, filename = 'ktp.jpg', quality = 0.9) {
    const isJpeg = dataURL.startsWith('data:image/jpeg') || dataURL.startsWith('data:image/jpg');
    let blob = isJpeg ? dataURLToBlobSafe(dataURL) : await reencodeToJpegBlobSafe(dataURL, quality);
    if (blob.type !== 'image/jpeg') blob = new Blob([blob], { type: 'image/jpeg' });

    // Paksa Blob untuk Cordova/Android atau File() tidak reliable
    const isCordova = typeof window !== 'undefined' && !!window.cordova;
    if (isCordova || !fileCtorReliable()) {
        return { blob, filename, type: 'image/jpeg' };
    }

    // Web modern saja: coba File(), tapi cek size
    try {
        const file = new File([blob], filename, { type: 'image/jpeg' });
        if (!file || !file.size) {
            // kalau size==0 => fallback ke Blob
            return { blob, filename, type: 'image/jpeg' };
        }
        return { file, filename, type: 'image/jpeg' };
    } catch {
        return { blob, filename, type: 'image/jpeg' };
    }
}
