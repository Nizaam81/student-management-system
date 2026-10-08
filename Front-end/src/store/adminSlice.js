import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    students: [],
    isLoadingStudents: false,
  },
  reducers: {
    setStudents(state, action) {
      state.students = action.payload;
    },
    addStudent(state, action) {
      state.students.unshift(action.payload);
    },
    updateStudent(state, action) {
      const updatedStudent = action.payload;
      const index = state.students.findIndex(
        (student) => student.id === updatedStudent.id,
      );

      if (index !== -1) {
        state.students[index] = {
          ...state.students[index],
          ...updatedStudent,
        };
      }
    },
    deleteStudent(state, action) {
      state.students = state.students.filter(
        (student) => student.id !== action.payload,
      );
    },
    setStudentsLoading(state, action) {
      state.isLoadingStudents = action.payload;
    },
    clearStudents(state) {
      state.students = [];
      state.isLoadingStudents = false;
    },
  },
});

export const {
  setStudents,
  addStudent,
  deleteStudent,
  updateStudent,
  setStudentsLoading,
  clearStudents,
} = adminSlice.actions;

export default adminSlice.reducer;
