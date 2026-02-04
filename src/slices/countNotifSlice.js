import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    count: null
}

const countNotifSlice = createSlice({
    name: 'countNotif',
    initialState,
    reducers: {
        updateCountNotif: (state, action) => {
            state.count = action.payload;
        },
    },
});

export const { updateCountNotif } = countNotifSlice.actions;
export const selectCountNotif = (state) => state.countNotif.count;

export default countNotifSlice.reducer;