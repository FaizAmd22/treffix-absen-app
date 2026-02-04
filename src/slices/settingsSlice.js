import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme : 'light';
};

const initialState = {
    theme: getInitialTheme(),
};

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        updateTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
    },
});

export const { updateTheme } = settingsSlice.actions;
export const selectSettings = (state) => state.settings.theme;

export default settingsSlice.reducer;