import { useState, useEffect } from 'react'
import axios from 'axios'

// Upload Component
function UploadSection({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [bankType, setBankType] = useState('apple_card')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleUpload = async (e) => {
    e.preventDefault()
    
    if (!file) {
      alert('Please select a file first')
      return
    }

    setUploading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('source_type', bankType)

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData)
      
      setMessage({
        success: true,
        text: response.data.message
      })

      setTimeout(() => {
        onUploadSuccess()
        setFile(null)
        setMessage(null)
        document.getElementById('fileInput').value = ''
      }, 1500)

    } catch (error) {
      setMessage({
        success: false,
        text: error.response?.data?.error || 'Upload failed'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={uploadStyles.container}>
      <div style={uploadStyles.header}>
        <h3 style={uploadStyles.title}>📤 Upload New Statement</h3>
        <p style={uploadStyles.subtitle}>Add your monthly transactions</p>
      </div>

      <form onSubmit={handleUpload} style={uploadStyles.form}>
        <div style={uploadStyles.row}>
          <div style={uploadStyles.field}>
            <label style={uploadStyles.label}>Bank:</label>
            <select 
              value={bankType}
              onChange={(e) => setBankType(e.target.value)}
              style={uploadStyles.select}
            >
              <option value="apple_card">Apple Card</option>
              <option value="boa_credit">Bank of America</option>
            </select>
          </div>

          <div style={uploadStyles.field}>
            <label style={uploadStyles.label}>CSV File:</label>
            <input
              id="fileInput"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              style={uploadStyles.fileInput}
            />
          </div>

          <button 
            type="submit"
            disabled={!file || uploading}
            style={!file || uploading ? uploadStyles.buttonDisabled : uploadStyles.button}
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload'}
          </button>
        </div>
      </form>

      {message && (
        <div style={message.success ? uploadStyles.success : uploadStyles.error}>
          <p style={uploadStyles.messageText}>{message.text}</p>
        </div>
      )}
    </div>
  )
}

// Main App
function App() {
  const [data, setData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [summaryRes, transRes] = await Promise.all([
        axios.get('http://localhost:5000/api/summary'),
        axios.get('http://localhost:5000/api/transactions?limit=1000')
      ])
      
      setData(summaryRes.data)
      setTransactions(transRes.data.transactions)
    } catch (err) {
      alert('Backend not running!')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  const getDateRange = () => {
    if (transactions.length === 0) return 'No data'
    
    const dates = transactions.map(t => new Date(t.transaction_date))
    const earliest = new Date(Math.min(...dates))
    const latest = new Date(Math.max(...dates))
    
    const formatDate = (date) => date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    })
    
    if (earliest.getMonth() === latest.getMonth() && 
        earliest.getFullYear() === latest.getFullYear()) {
      return formatDate(earliest)
    } else {
      return `${formatDate(earliest)} - ${formatDate(latest)}`
    }
  }

  const dateRange = getDateRange()
  const sortedCategories = [...data.category_breakdown]
    .sort((a, b) => b.amount - a.amount)

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h1 style={styles.sidebarLogo}>Finance</h1>
        </div>
        <nav style={styles.sidebarNav}>
          <div style={styles.navItemActive}>
            <span style={styles.navIcon}>📊</span>
            <span>Overview</span>
          </div>
          <div style={styles.navItem}>
            <span style={styles.navIcon}>💳</span>
            <span>Transactions</span>
          </div>
          <div style={styles.navItem}>
            <span style={styles.navIcon}>📈</span>
            <span>Analytics</span>
          </div>
        </nav>
      </aside>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h2 style={styles.pageTitle}>Overview</h2>
            <p style={styles.pageSubtitle}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div style={styles.content}>
          {/* 4 Stats Cards */}
          <div style={styles.cards}>
            {/* Card 1: Spending */}
            <div style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.cardLabel}>Total Spending</span>
                <div style={styles.badgeRed}>↓ Expense</div>
              </div>
              <p style={styles.cardValueRed}>
                ${data.total_spending.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
              <div style={styles.cardFooter}>
                <span style={styles.cardChange}>{dateRange}</span>
              </div>
            </div>

            {/* Card 2: Income */}
            <div style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.cardLabel}>Total Income</span>
                <div style={styles.badgeGreen}>↑ Income</div>
              </div>
              <p style={styles.cardValueGreen}>
                ${data.total_income.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
              <div style={styles.cardFooter}>
                <span style={styles.cardChange}>{dateRange}</span>
              </div>
            </div>

            {/* Card 3: Net Balance */}
            <div style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.cardLabel}>Net Balance</span>
                <div style={data.net >= 0 ? styles.badgeGreen : styles.badgeRed}>
                  {data.net >= 0 ? '✓ Positive' : '! Negative'}
                </div>
              </div>
              <p style={data.net >= 0 ? styles.cardValueGreen : styles.cardValueRed}>
                {data.net >= 0 ? '+' : ''}${Math.abs(data.net).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
              <div style={styles.cardFooter}>
                <span style={styles.cardChange}>{dateRange}</span>
              </div>
            </div>

            {/* 🆕 Card 4: Total Transactions - NEW CARD HERE */}
            <div style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.cardLabel}>Total Transactions</span>
                <div style={styles.badgeBlue}>📊 Count</div>
              </div>
              <p style={styles.cardValueBlue}>
                {transactions.length}
              </p>
              <div style={styles.cardFooter}>
                <span style={styles.cardChange}>{dateRange}</span>
              </div>
            </div>
          </div>

          <UploadSection onUploadSuccess={loadData} />

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Spending by Category</h3>
              <span style={styles.sectionSubtitle}>
                {sortedCategories.length} categories
              </span>
            </div>

            <div style={styles.categoryList}>
              {sortedCategories.map((category, index) => {
                const percentage = ((category.amount / data.total_spending) * 100).toFixed(1)
                
                return (
                  <div key={index} style={styles.categoryItem}>
                    <div style={styles.categoryLeft}>
                      <div style={styles.categoryInfo}>
                        <span style={styles.categoryName}>{category.category}</span>
                        <span style={styles.categoryAmount}>
                          ${category.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>
                      
                      <div style={styles.progressBarContainer}>
                        <div 
                          style={{
                            ...styles.progressBar,
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                    </div>

                    <div style={styles.categoryRight}>
                      <span style={styles.percentage}>{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Styles
const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0,
  },
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid #e5e7eb',
  },
  sidebarLogo: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  sidebarNav: {
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: '#f3f4f6',
    color: '#111827',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  navIcon: {
    fontSize: '18px',
  },
  main: {
    flex: 1,
    marginLeft: '240px',
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '32px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  content: {
    padding: '32px 40px',
    overflowY: 'auto',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    transition: 'all 0.2s ease',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  badgeRed: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  badgeGreen: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#d1fae5',
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  badgeBlue: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  cardValueRed: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#dc2626',
    margin: '0 0 16px 0',
    letterSpacing: '-1px',
  },
  cardValueGreen: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#059669',
    margin: '0 0 16px 0',
    letterSpacing: '-1px',
  },
  cardValueBlue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#2563eb',
    margin: '0 0 16px 0',
    letterSpacing: '-1px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChange: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  section: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f3f4f6',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  categoryItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },
  categoryLeft: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  categoryInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  categoryAmount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  progressBarContainer: {
    height: '8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  categoryRight: {
    minWidth: '60px',
    textAlign: 'right',
  },
  percentage: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#6b7280',
    fontSize: '14px',
  },
}

const uploadStyles = {
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  form: {
    marginBottom: '12px',
  },
  row: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
  },
  field: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
  },
  fileInput: {
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
  },
  button: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  buttonDisabled: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#9ca3af',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
  },
  success: {
    padding: '12px 16px',
    backgroundColor: '#d1fae5',
    border: '1px solid #10b981',
    borderRadius: '8px',
  },
  error: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    border: '1px solid #dc2626',
    borderRadius: '8px',
  },
  messageText: {
    fontSize: '14px',
    fontWeight: '500',
    margin: 0,
  },
}

export default App