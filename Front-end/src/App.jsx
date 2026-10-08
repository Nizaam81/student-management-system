import React from 'react';

import { StudentLogin } from './components/auth/StudentLogin';
import { StudentSignup } from './components/auth/StudentSignup';
import { AdminLogin } from './components/auth/AdminLogin';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { StudentHome } from './components/student/StudentHome';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Navigate, Route, Routes } from 'react-router-dom';


export const App = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col font-sans">

      <main className="flex-1">
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={<StudentLogin />} />
            <Route path="/signup" element={<StudentSignup />} />
            <Route path="/admin-login" element={<AdminLogin />} />
          </Route>
          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/student-home" element={<StudentHome />} />
          </Route>
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

    </div>
  );
};

export default App;