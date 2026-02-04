import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'tab-1',
};

export const tabNotifSlice = createSlice({
  name: 'tabNotif',
  initialState,
  reducers: {
    setActiveTabNotif: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTabNotif } = tabNotifSlice.actions;

export const selectActiveTabNotif = (state) => state.tabNotif.activeTab;

export default tabNotifSlice.reducer;
