import { APIWonder } from "../api/wonderpush";

export const pushNotification = async ({ email, title, text, image }) => {
    const accessToken = import.meta.env.VITE_WONDERPUSH_ACCESS_TOKEN;

    // Validasi parameter yang diperlukan
    if (!email) {
        console.error("Error: email tidak disediakan untuk push notification");
        return;
    }

    const deliveryPayload = {
        targetUserIds: [email],
        notification: {
            alert: {
                title: title || "Reminder",
                text: text || "Anda memiliki reminder baru",
            },
        },
    };

    // Tambahkan gambar hanya jika tersedia
    if (image) {
        deliveryPayload.notification.alert.android = {
            type: "bigPicture",
            bigPicture: image,
        };
    }

    try {
        console.log("Sending payload to WonderPush:", JSON.stringify(deliveryPayload));
        const response = await APIWonder.post(
            `/deliveries?accessToken=${accessToken}`,
            deliveryPayload
        );

        const data = response.data;
        console.log("Response dari WonderPush API:", data);

        if (data && data.success) {
            console.log("Notifikasi berhasil dikirim dengan ID:", data.id);
            return data;
        } else {
            console.error("Gagal mengirim notifikasi:", data);
            return null;
        }
    } catch (error) {
        console.error("ERROR PUSH NOTIFICATION:", error);
        console.error("Message:", error.message);
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
        return null;
    }
};