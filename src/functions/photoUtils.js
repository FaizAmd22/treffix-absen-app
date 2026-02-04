import { showToastFailed } from './toast';
import { API } from '../api/axios';

export const isCordova = () => typeof window !== 'undefined' && window.cordova !== undefined;
export const isMobileDevice = () =>
    typeof window.orientation !== "undefined" || navigator.userAgent.includes("IEMobile");

export const capturePhoto = ({ onSuccess, onError, setUploading, typeProof, typeUpload }) => {
    setUploading(true);
    console.log("capturePhoto run...");

    console.log("typeUpload :", typeUpload);

    if (typeUpload == "camera") {
        const destinationType =
            device.platform === 'iOS'
                ? window.Camera.DestinationType.NATIVE_URI
                : window.Camera.DestinationType.FILE_URI;

        navigator.camera.getPicture(
            (imageUri) => {
                const fileInfo = {
                    uri: imageUri,
                    name: `photo_${new Date().getTime()}.jpg`,
                    type: 'image/jpeg',
                };
                onSuccess(fileInfo, imageUri);
            },
            (error) => {
                showToastFailed(`Gagal ambil foto: ${error}`);
                onError?.(error);
                setUploading(false);
            },
            {
                quality: 75,
                destinationType,
                sourceType: window.Camera.PictureSourceType.CAMERA,
                encodingType: window.Camera.EncodingType.JPEG,
                mediaType: window.Camera.MediaType.PICTURE,
                allowEdit: false,
                correctOrientation: true,
                saveToPhotoAlbum: true,
                targetWidth: 1200,
                targetHeight: 1200,
            }
        );
    } else {
        setUploading(false);
        document.getElementById(typeProof)?.click();
    }
};

export const uploadImageToAPI = async ({ file, setImageUrl, setUploading, token }) => {
    try {
        setUploading(true);

        console.log("uploadImageToAPI run...");

        if (typeof file === 'string' && isCordova()) {
            const apiBaseUrl = API.defaults.baseURL || '';
            const uploadURL = apiBaseUrl + '/mobile/form-request/proof';

            return new Promise((resolve, reject) => {
                const fileTransfer = new FileTransfer();
                const options = {
                    fileKey: 'proof',
                    fileName: `photo_${new Date().getTime()}.jpg`,
                    mimeType: 'image/jpeg',
                    chunkedMode: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                fileTransfer.upload(
                    file,
                    encodeURI(uploadURL),
                    (result) => {
                        try {
                            const response = JSON.parse(result.response);
                            const imageUrl = response.payload?.url;
                            if (imageUrl) {
                                setImageUrl(imageUrl);
                                resolve(true);
                            } else {
                                showToastFailed('Format tidak sesuai.');
                                resolve(false);
                            }
                        } catch {
                            showToastFailed('Server tidak merespon.');
                            resolve(false);
                        }
                    },
                    (error) => {
                        showToastFailed('Upload gagal.');
                        reject(error);
                    },
                    options
                );
            });
        }

        if (file instanceof File) {
            const formData = new FormData();
            formData.append('proof', file, file.name);

            const response = await API.post('/mobile/form-request/proof', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            const imageUrl = response.data?.payload?.url;
            if (imageUrl) {
                setImageUrl(imageUrl);
                return true;
            } else {
                showToastFailed('Format tidak sesuai.');
                return false;
            }
        }

        throw new Error('Unsupported file format');
    } catch (err) {
        showToastFailed('Upload gagal.');
        return false;
    } finally {
        setUploading(false);
    }
};
