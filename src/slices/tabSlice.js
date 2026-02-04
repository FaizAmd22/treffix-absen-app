import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'view-home',
};

export const tabSlice = createSlice({
  name: 'tab',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = tabSlice.actions;

export const selectActiveTab = (state) => state.tab.activeTab;

export default tabSlice.reducer;
