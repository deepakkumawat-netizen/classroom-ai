import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import WorksheetGenerator from './pages/WorksheetGenerator'
import LessonPlanGenerator from './pages/LessonPlanGenerator'
import MCAssessment from './pages/MCAssessment'
import AutoGenerator from './pages/AutoGenerator'
import TeacherInsights from './pages/TeacherInsights'
import QuizGenerator from './pages/QuizGenerator'
import HistoryPage from './pages/HistoryPage'

function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auto-generate" element={<AutoGenerator />} />
          <Route path="/worksheet" element={<WorksheetGenerator />} />
          <Route path="/lesson-plan" element={<LessonPlanGenerator />} />
          <Route path="/mc-assessment" element={<MCAssessment />} />
          <Route path="/teacher-insights" element={<TeacherInsights />} />
          <Route path="/quiz-generator" element={<QuizGenerator />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
