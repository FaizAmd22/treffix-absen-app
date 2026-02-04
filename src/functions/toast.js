import { f7 } from "framework7-react";

export const showToast = (message, theme) => {
    const toasts = f7.toast.create({
        text: `
            <div style="width: 84vw; display: flex; justify-content: space-between; align-items: center;">
                <p style="font-size: var(--font-sm)">${message}</p>
                <i class="icon f7-icons toast-close-icon" style="margin-left: 10px; cursor: pointer;">xmark</i>
            </div>
        `,
        position: 'bottom',
        closeTimeout: 2000,
        closeButton: false,
        cssClass: theme == "light" ? 'light-toast' : 'dark-toast',
    });

    toasts.open();

    setTimeout(() => {
        const closeBtn = document.querySelector('.toast-close-icon');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toasts.close();
            });
        }
    }, 500);
};

export const showToastFailed = (message) => {
    const toasts = f7.toast.create({
        text: `
            <div style="width: 84vw; display: flex; justify-content: space-between; align-items: center;">
                <p style="font-size: var(--font-sm)">${message}</p>
                <i class="icon f7-icons toast-close-icon" style="margin-left: 10px; cursor: pointer;">xmark</i>
            </div>
        `,
        position: 'bottom',
        closeTimeout: 5000,
        closeButton: false,
        cssClass: 'failed-toast',
    });

    toasts.open();

    setTimeout(() => {
        const closeBtn = document.querySelector('.toast-close-icon');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toasts.close();
            });
        }
    }, 500);
};