import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    test: "pre-test"
}

const testSlice = createSlice({
    name: 'tests',
    initialState,
    reducers: {
        updateTest: (state, action) => {
            state.test = action.payload;
        },
    },
});

export const { updateTest } = testSlice.actions;
export const selectTest = (state) => state.tests.test;

export default testSlice.reducer;