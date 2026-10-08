import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './adminSlice';
import studentReducer from './studentSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    student: studentReducer,
  },
});
