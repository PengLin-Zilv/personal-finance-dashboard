import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [data, setData] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:5000/api/summary')
      .then(res => setData(res.data))
      .catch(err => alert('Backend not running!'))
  }, [])

  if (!data) return <h2>Loading...</h2>

  return (
    <div style={{ padding: '20px' }}>
      <h1>💰 Finance Dashboard</h1>
      <p>Spending: ${data.total_spending.toFixed(2)}</p>
      <p>Income: ${data.total_income.toFixed(2)}</p>
      <p>Net: ${data.net.toFixed(2)}</p>
    </div>
  )
}

export default App