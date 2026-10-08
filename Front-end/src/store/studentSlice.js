import { createSlice } from '@reduxjs/toolkit';

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    profile: null,
  },
  reducers: {
    setCurrentUser(state, action) {
      state.profile = action.payload;
    },
    updateCurrentUser(state, action) {
      state.profile = { ...state.profile, ...action.payload };
    },
    clearCurrentUser(state) {
      state.profile = null;
    },
  },
});

export const { setCurrentUser, updateCurrentUser, clearCurrentUser } =
  studentSlice.actions;
export default studentSlice.reducer;
