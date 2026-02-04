import { createSlice } from '@reduxjs/toolkit';

const getInitialLanguages = () => {
    const savedLanguages = localStorage.getItem('language');
    return savedLanguages ? savedLanguages : 'id';
}

const initialState = {
    language: getInitialLanguages()
}

const languageSlice = createSlice({
    name: 'languages',
    initialState,
    reducers: {
        updateLanguage: (state, action) => {
            state.language = action.payload;
            localStorage.setItem('language', action.payload);
        },
    },
});

export const { updateLanguage } = languageSlice.actions;
export const selectLanguages = (state) => state.languages.language;

export default languageSlice.reducer;