import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    openVerifEmail: false,
    openVerifPasword: false,
    isVerif: false,
};

const verificationSlice = createSlice({
    name: "verification",
    initialState,
    reducers: {
        updateOpenVerifEmail: (state, action) => {
            state.openVerifEmail = action.payload;
        },
        updateOpenVerifPassword: (state, action) => {
            state.openVerifPasword = action.payload;
        },
        updateIsVerif: (state, action) => {
            state.isVerif = action.payload;
        },
    },
});

export const { updateOpenVerifEmail, updateOpenVerifPassword, updateIsVerif } = verificationSlice.actions;
export const selectOpenVerifEmail = (state) => state.verification.openVerifEmail;
export const selectOpenVerifPassword = (state) => state.verification.openVerifPasword;
export const selectIsVerif = (state) => state.verification.isVerif;

export default verificationSlice.reducer;