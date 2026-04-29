import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import WorksheetGenerator from './pages/WorksheetGenerator'
import LessonPlanGenerator from './pages/LessonPlanGenerator'
import MCAssessment from './pages/MCAssessment'
import AutoGenerator from './pages/AutoGenerator'
import TeacherInsights from './pages/TeacherInsights'
import QuizGenerator from './pages/QuizGenerator'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="page-body">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auto-generate" element={<AutoGenerator />} />
              <Route path="/worksheet" element={<WorksheetGenerator />} />
              <Route path="/lesson-plan" element={<LessonPlanGenerator />} />
              <Route path="/mc-assessment" element={<MCAssessment />} />
              <Route path="/teacher-insights" element={<TeacherInsights />} />
              <Route path="/quiz-generator" element={<QuizGenerator />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}
