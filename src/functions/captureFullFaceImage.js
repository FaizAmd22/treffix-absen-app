// export const captureFullFaceImage = (video, canvas, centerX, centerY, radius) => {
//     const tempCanvas = document.createElement('canvas');
//     tempCanvas.width = radius * 2;
//     tempCanvas.height = radius * 2;
//     const tempCtx = tempCanvas.getContext('2d');

//     tempCtx.beginPath();
//     tempCtx.arc(radius, radius, radius, 0, Math.PI * 2);
//     tempCtx.clip();

//     tempCtx.drawImage(
//         video,
//         centerX - radius,
//         centerY - radius,
//         radius * 2,
//         radius * 2,
//         0,
//         0,
//         radius * 2,
//         radius * 2
//     );

//     return tempCanvas.toDataURL('image/jpeg');
// };

export const captureFullFaceImage = (video, canvas) => {
    const tempCanvas = document.createElement('canvas');

    tempCanvas.width = video.videoWidth || canvas.width;
    tempCanvas.height = video.videoHeight || canvas.height;

    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(
        video,
        0, 0,
        video.videoWidth || canvas.width,
        video.videoHeight || canvas.height,
        0, 0,
        tempCanvas.width,
        tempCanvas.height
    );

    return tempCanvas.toDataURL('image/jpeg', 0.8);
};
