import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RootRedirect from './pages/RootRedirect';

import AdminLayout from './pages/admin/AdminLayout';
import AdminQuestionBankPage from './pages/admin/AdminQuestionBankPage';
import AdminQuestionFormPage from './pages/admin/AdminQuestionFormPage';

import TutorLayout from './pages/tutor/TutorLayout';
import TutorHomeworkListPage from './pages/tutor/TutorHomeworkListPage';
import TutorCreateHomeworkPage from './pages/tutor/TutorCreateHomeworkPage';
import TutorHomeworkDetailPage from './pages/tutor/TutorHomeworkDetailPage';

import ParentLayout from './pages/parent/ParentLayout';
import ParentChildrenPage from './pages/parent/ParentChildrenPage';
import ParentChildHomeworkListPage from './pages/parent/ParentChildHomeworkListPage';
import ParentHomeworkAnswerPage from './pages/parent/ParentHomeworkAnswerPage';
import ParentMarketplacePage from './pages/parent/ParentMarketplacePage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminQuestionBankPage />} />
            <Route path="questions/new" element={<AdminQuestionFormPage />} />
            <Route path="questions/:bankQuestionId/edit" element={<AdminQuestionFormPage />} />
          </Route>

          <Route
            path="/tutor"
            element={
              <ProtectedRoute role="TUTOR">
                <TutorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TutorHomeworkListPage />} />
            <Route path="homeworks/new" element={<TutorCreateHomeworkPage />} />
            <Route path="homeworks/:homeworkId" element={<TutorHomeworkDetailPage />} />
          </Route>

          <Route
            path="/parent"
            element={
              <ProtectedRoute role="PARENT">
                <ParentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ParentChildrenPage />} />
            <Route path="marketplace" element={<ParentMarketplacePage />} />
            <Route path="children/:childId" element={<ParentChildHomeworkListPage />} />
            <Route path="children/:childId/homeworks/:homeworkId" element={<ParentHomeworkAnswerPage />} />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
