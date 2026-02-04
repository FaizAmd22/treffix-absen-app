import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    otp: null
}

const otpSlice = createSlice({
    name: 'otps',
    initialState,
    reducers: {
        updateOtp: (state, action) => {
            state.otp = action.payload;
        },
    },
});

export const { updateOtp } = otpSlice.actions;
export const selectOtp = (state) => state.otps.otp;

export default otpSlice.reducer;