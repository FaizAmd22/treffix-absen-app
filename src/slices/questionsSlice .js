import { createSlice } from "@reduxjs/toolkit";

const initialQuestionsState = [];

const questionsSlice = createSlice({
    name: "questions",
    initialState: initialQuestionsState,
    reducers: {
        setQuestions: (state, action) => {
            return action.payload;
        },
        resetQuestions: () => initialQuestionsState,
    },
});

export const { setQuestions, resetQuestions } = questionsSlice.actions;
export const selectQuestion = (state) => state.questions;
export default questionsSlice.reducer;
