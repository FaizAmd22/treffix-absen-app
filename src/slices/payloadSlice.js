import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: null,
    next_step: null,
    step: null,
    title: null,
};

const payloadSlice = createSlice({
    name: "payload",
    initialState,
    reducers: {
        setPayloadData: (state, action) => {
            const { payload } = action;
            state.data = payload.data || null;
            state.next_step = payload.next_step || null;
            state.step = payload.step || null;
            state.title = payload.title || null;
        },
        resetPayload: () => initialState,
    },
});

export const { setPayloadData, resetPayload } = payloadSlice.actions;
export const selectPayload = (state) => state.payload
export default payloadSlice.reducer;
