import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    overtimeIn: null,
    overtimeOut: null,
};

const overtimeSlice = createSlice({
    name: 'overtime',
    initialState,
    reducers: {
        setOvertimeIn: (state, action) => {
            state.overtimeIn = action.payload;
        },
        setOvertimeOut: (state, action) => {
            state.overtimeOut = action.payload;
        },
        resetOvertime: (state) => {
            state.overtimeIn = null;
            state.overtimeOut = null;
        },
    },
});

export const { setOvertimeIn, setOvertimeOut, resetOvertime } = overtimeSlice.actions;
export const selectOvertimes = (state) => state.overtime;
export const selectOvertimeIn = (state) => state.overtime.overtimeIn;
export const selectOvertimeOut = (state) => state.overtime.overtimeOut;

export default overtimeSlice.reducer;
