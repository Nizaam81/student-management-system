import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  LogOut,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Users,
  Mail,
  Phone,
  X,
} from 'lucide-react';
import { StudentModal } from './StudentModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import api from '../../config/axios';
import { clearTokens, getAccessToken } from '../../config/jwt';
import {
  addStudent,
  clearStudents,
  deleteStudent,
  setStudents,
  setStudentsLoading,
  updateStudent,
} from '../../store/adminSlice';
import { clearCurrentUser } from '../../store/studentSlice';

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const students = useSelector((state) => state.admin.students);
  const isLoadingStudents = useSelector(
    (state) => state.admin.isLoadingStudents,
  );
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  const handleLogout = () => {
    clearTokens();
    dispatch(clearStudents());
    dispatch(clearCurrentUser());
    toast.success('Logged out successfully.');
    navigate('/admin-login', { replace: true });
  };

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error('Admin authentication is required. Please log in again.');
      return undefined;
    }

    let isCurrent = true;
    dispatch(setStudentsLoading(true));

    api
      .get('/api/admin/students', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data }) => {
        if (!isCurrent) return;
        if (!Array.isArray(data.users)) {
          throw new Error('The students response did not include a users list.');
        }

        dispatch(
          setStudents(
            data.users
              .filter((user) => user.isAdmin !== true)
              .map((user) => ({
                id: String(user.id || user._id),
                name: user.name || '',
                studentId: user.studentId || '—',
                email: user.email || '',
                phone: user.phone || '',
                cgpa: user.cgpa ?? 'N/A',
                enrolledDate: user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : '—',
              })),
          ),
        );
      })
      .catch((error) => {
        if (!isCurrent) return;
        toast.error(
          error.response?.data?.message ||
            error.message ||
            'Unable to load students.',
        );
      })
      .finally(() => {
        if (isCurrent) dispatch(setStudentsLoading(false));
      });

    return () => {
      isCurrent = false;
    };
  }, [dispatch]);

  const openAddStudentModal = () => {
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  };

  const openEditStudentModal = (student) => {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const closeStudentModal = () => {
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  const saveStudent = async (formData) => {
    const {
      name,
      email,
      phone,
    } = formData;
    const studentData = { name, phone };

    if (editingStudent) {
      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          toast.error('Admin authentication is required. Please log in again.');
          return;
        }

        const { data } = await api.patch(
          `/api/admin/students/${editingStudent.id}`,
          studentData,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );

        if (!data.user) {
          throw new Error('The update response did not include student data.');
        }

        dispatch(
          updateStudent({
            ...editingStudent,
            ...data.user,
            id: String(data.user.id || data.user._id || editingStudent.id),
            enrolledDate: data.user.createdAt
              ? new Date(data.user.createdAt).toLocaleDateString()
              : editingStudent.enrolledDate,
          }),
        );
        toast.success(data.message || 'Student updated successfully.');
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            'Unable to update student.',
        );
        return;
      }
    } else {
      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          toast.error('Admin authentication is required. Please log in again.');
          return;
        }

        const { data } = await api.post(
          '/api/admin/add-student',
          {
            name,
            email,
            phone,
            password: formData.password,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        if (!data.user) {
          throw new Error('The add-student response did not include user data.');
        }

        dispatch(
          addStudent({
            ...data.user,
            id: String(data.user.id || data.user._id),
            cgpa: 'N/A',
            enrolledDate: data.user.createdAt
              ? new Date(data.user.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString(),
          }),
        );
        toast.success(data.message || 'Student added successfully.');
      } catch (error) {
        toast.error(
          error.response?.data?.message || error.message || 'Unable to add student.',
        );
        return;
      }
    }

    closeStudentModal();
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error('Admin authentication is required. Please log in again.');
        return;
      }

      const { data } = await api.delete(
        `/api/admin/students/${studentToDelete.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      dispatch(deleteStudent(studentToDelete.id));
      toast.success(data.message || 'Student deleted successfully.');
      setStudentToDelete(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Unable to delete student.',
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs uppercase font-mono tracking-widest text-zinc-400">
                Administrator Console • System v2.4
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Student Directory Management
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Search, enroll, update records, and oversee academic roster
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openAddStudentModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs sm:text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4 text-zinc-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 gap-4">

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">
                Total Enrolled
              </span>
              <Users className="w-4 h-4 text-zinc-500" />
            </div>
            <p className="text-2xl font-bold text-white">{students.length}</p>
          </div>

        </div>

        {/* Search & Filter UI */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">

          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search students by name or email"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-10 py-2.5 bg-black border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                title="Clear search"
                className="absolute inset-y-0 right-2 flex items-center justify-center p-1.5 text-zinc-500 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAddStudentModal}
              className="sm:hidden p-2.5 bg-white text-black rounded-xl"
              title="Add Student"
              aria-label="Add student"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">

          <div className="px-4 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Student Roster
              </span>

              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                {filteredStudents.length} of {students.length} Records
              </span>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">

              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Student ID</th>
                  <th className="py-3.5 px-6">Contact</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {isLoadingStudents ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-sm text-zinc-400">
                      Loading students...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-zinc-400">
                      {students.length === 0
                        ? 'No students found.'
                        : 'No students match your search.'}
                    </td>
                  </tr>
                ) : filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-zinc-900/30 transition-colors"
                  >

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center shrink-0">
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)}
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            {student.name}
                          </p>

                          <p className="text-xs text-zinc-500 font-mono">
                            Enrolled: {student.enrolledDate}
                          </p>
                        </div>

                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-mono text-xs text-zinc-300">
                        {student.studentId}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-0.5">

                        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{student.email}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Phone className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{student.phone}</span>
                        </div>

                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">

                        <button
                          type="button"
                          onClick={() => openEditStudentModal(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs font-medium transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStudentToDelete(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-white hover:text-black text-zinc-300 text-xs font-medium transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* Mobile / Tablet Cards */}
          <div className="lg:hidden divide-y divide-zinc-800/80">

            {isLoadingStudents ? (
              <p className="p-6 text-center text-sm text-zinc-400">
                Loading students...
              </p>
            ) : filteredStudents.length === 0 ? (
              <p className="p-6 text-center text-sm text-zinc-400">
                {students.length === 0
                  ? 'No students found.'
                  : 'No students match your search.'}
              </p>
            ) : filteredStudents.map((student) => (
              <div
                key={student.id}
                className="p-4 sm:p-5 space-y-3"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center shrink-0">
                      {student.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </div>

                    <div>
                      <p className="font-semibold text-white text-base">
                        {student.name}
                      </p>

                      <p className="text-xs font-mono text-zinc-400">
                        {student.studentId}
                      </p>
                    </div>

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400 pt-1">

                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>{student.phone}</span>
                  </div>

                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-zinc-800/60">

                  <button
                    type="button"
                    onClick={() => openEditStudentModal(student)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentToDelete(student)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-white hover:text-black text-xs font-medium transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                </div>

              </div>
            ))}

          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 font-mono">

            <span>
              Showing {filteredStudents.length} of {students.length} students
            </span>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-700" />
              <span>Black &amp; White Strict Palette</span>
            </div>

          </div>

        </div>

      </div>
      {isStudentModalOpen && (
        <StudentModal
          key={editingStudent?.id || 'new-student'}
          student={editingStudent}
          students={students}
          onClose={closeStudentModal}
          onSave={saveStudent}
        />
      )}
      {studentToDelete && (
        <DeleteConfirmModal
          student={studentToDelete}
          onCancel={() => setStudentToDelete(null)}
          onConfirm={confirmDeleteStudent}
        />
      )}
    </div>
  );
};