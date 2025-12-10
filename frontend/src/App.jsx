import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IssueListPage from './pages/IssueListPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/issues" element={<IssueListPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
