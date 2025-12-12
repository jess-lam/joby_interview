import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import IssueListPage from './pages/IssueListPage'
import CreateIssuePage from './pages/CreateIssuePage'
import ShowIssuePage from './pages/ShowIssuePage'
import EditIssuePage from './pages/EditIssuePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/issues" replace />} />
        <Route path="/issues/new" element={<CreateIssuePage />} />
        <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        <Route path="/issues/:id" element={<ShowIssuePage />} />
        <Route path="/issues" element={<IssueListPage />} />
        <Route path="*" element={<Navigate to="/issues" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
