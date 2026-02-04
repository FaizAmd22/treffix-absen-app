import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isVisible: false,
    message: '',
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        showNotification: (state, action) => {
            state.isVisible = true;
            state.message = action.payload;
        },
        hideNotification: (state) => {
            state.isVisible = false;
            state.message = '';
        },
    },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export const selectNotification = (state) => state.notification;

export default notificationSlice.reducer;