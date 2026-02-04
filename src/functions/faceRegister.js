import { API } from "../api/axios";

export const sendFaceRegister = async (blob, fileName = "capture.jpeg") => {
    try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("photo", blob, fileName);

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        const response = await API.post(
            "/profile/face-verification",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error in sendFaceRegister:", error);
        throw error;
    }
};


export function base64ToBlob(base64Data) {
    const [header, data] = base64Data.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

    const binary = atob(data);
    const len = binary.length;
    const u8arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        u8arr[i] = binary.charCodeAt(i);
    }

    return new Blob([u8arr], { type: mime });
}


// export function base64ToFile(base64String, fileName, mimeType) {
//     const byteString = atob(base64String.split(',')[1]);
//     const arrayBuffer = new ArrayBuffer(byteString.length);
//     const uint8Array = new Uint8Array(arrayBuffer);
//     for (let i = 0; i < byteString.length; i++) {
//         uint8Array[i] = byteString.charCodeAt(i);
//     }
//     return new File([uint8Array], fileName, { type: mimeType });
// }
