import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { Departments } from './pages/admin/Departments';
import { DepartmentDetails } from './pages/admin/DepartmentDetails';
import { Complaints } from './pages/admin/Complaints';
import { Accounts } from './pages/admin/Accounts';
import AssignedComplaints from './pages/agent/AssignedComplaints';
import { Profile } from './pages/user/Profile';
import { AnalystDashboard } from './pages/analyst/AnalystDashboard';
import { ComplaintAnalytics } from './pages/analyst/ComplaintAnalytics';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationsPage from './pages/notifications/NotificationsPage';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Profil — accessible à tous les rôles */}
            <Route path="/user" element={<DashboardLayout />}>
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Route pour la page des notifications accessible à tous */}
            <Route path="/notifications" element={<DashboardLayout />}>
              <Route index element={<NotificationsPage />} />
            </Route>

            {/* Routes Admin */}
            <Route path="/admin/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="departments" element={<Departments />} />
              <Route path="departments/:id" element={<DepartmentDetails />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="accounts" element={<Accounts />} />
            </Route>

            {/* Routes Agent */}
            <Route path="/agent" element={<DashboardLayout />}>
              <Route path="complaints" element={<AssignedComplaints />} />
            </Route>

            {/* Routes Analyste */}
            <Route path="/analyst" element={<DashboardLayout />}>
              <Route path="dashboard" element={<AnalystDashboard />} />
              <Route path="analytics" element={<ComplaintAnalytics />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;