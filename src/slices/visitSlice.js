import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    visitIn: null,
    visitOut: null,
};

const visitSlice = createSlice({
    name: 'visit',
    initialState,
    reducers: {
        setVisitIn: (state, action) => {
            state.visitIn = action.payload;
        },
        setVisitOut: (state, action) => {
            state.visitOut = action.payload;
        },
        resetVisit: (state) => {
            state.visitIn = null;
            state.visitOut = null;
        },
    },
});

export const { setVisitIn, setVisitOut, resetVisit } = visitSlice.actions;
export const selectVisit = (state) => state.visit;
export const selectVisitIn = (state) => state.visit.visitIn;
export const selectVisitOut = (state) => state.visit.visitOut;

export default visitSlice.reducer;
