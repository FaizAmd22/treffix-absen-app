import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        updateUser: (state, action) => {
            return { ...state, ...action.payload };
        },
    },
});


export const { updateUser } = userSlice.actions;

export const selectUser = (state) => state.users;

export default userSlice.reducer;