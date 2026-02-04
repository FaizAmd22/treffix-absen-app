import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    absenIn: null,
    absenOut: null,
};

const absentSlice = createSlice({
    name: 'absent',
    initialState,
    reducers: {
        setAbsentIn: (state, action) => {
            state.absenIn = action.payload;
        },
        setAbsentOut: (state, action) => {
            state.absenOut = action.payload;
        },
        resetAbsent: (state) => {
            state.absenIn = null;
            state.absenOut = null;
        },
    },
});

export const { setAbsentIn, setAbsentOut, resetAbsent } = absentSlice.actions;
export const selectAbsents = (state) => state.absent;
export const selectAbsentIn = (state) => state.absent.absenIn;
export const selectAbsentOut = (state) => state.absent.absenOut;

export default absentSlice.reducer;
