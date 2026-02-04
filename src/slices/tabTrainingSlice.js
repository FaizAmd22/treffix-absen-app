import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'tab-1',
};

export const tabTrainingSlice = createSlice({
  name: 'tabTraining',
  initialState,
  reducers: {
    setActiveTabTraining: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTabTraining } = tabTrainingSlice.actions;

export const selectActiveTabTraining = (state) => state.tabTraining.activeTab;

export default tabTrainingSlice.reducer;
