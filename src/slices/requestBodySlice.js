import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    employee_id: '',
    coordinate: {
        latitude: '',
        longitude: '',
    },
    timestamp: '',
    attendance_type: '',
    picture: '',
};

const requestBodySlice = createSlice({
    name: 'requestbody',
    initialState,
    reducers: {
        setRequestBodyData: (state, action) => {
            return { ...action.payload };
        },
        clearRequestBodyData: () => initialState,
    },
});

export const { setRequestBodyData, clearRequestBodyData } = requestBodySlice.actions;
export const selectRequestBody = (state) => state.requestbody;

export default requestBodySlice.reducer;
