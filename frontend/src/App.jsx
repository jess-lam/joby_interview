import { useState, useEffect } from 'react'
import './App.css'
import api from './services/api'

function App() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchHealthCheck()
  }, [])

  const fetchHealthCheck = async () => {
    try {
      setLoading(true)
      const response = await api.get('/health')
      setMessage(response.data.status)
    } catch (error) {
      console.error('Error fetching health check:', error)
      setMessage('Error connecting to backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Joby Interview Project</h1>
        <p>React + FastAPI + PostgreSQL</p>
        <div className="status">
          <h2>Backend Status:</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <p className={message === 'healthy' ? 'success' : 'error'}>
              {message || 'Not connected'}
            </p>
          )}
        </div>
        <button onClick={fetchHealthCheck} disabled={loading}>
          Refresh Status
        </button>
      </header>
    </div>
  )
}

export default App


