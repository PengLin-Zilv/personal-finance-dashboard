import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:5000/api/summary')
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(err => {
        alert('Backend not running!')
        console.error(err)
      })
  }, [])

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={styles.app}>
      {/* Sidebar */}
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

      {/* Main content - full width */}
      <main style={styles.main}>
        {/* Top bar */}
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

        {/* Stats cards - full width grid */}
        <div style={styles.cards}>
          {/* Spending Card */}
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
              <span style={styles.cardChange}>Last 30 days</span>
            </div>
          </div>

          {/* Income Card */}
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
              <span style={styles.cardChange}>Last 30 days</span>
            </div>
          </div>

          {/* Net Balance Card */}
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
              <span style={styles.cardChange}>
                {data.net >= 0 ? 'Good standing' : 'Review budget'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Modern full-screen layout styles
const styles = {
  // Full screen container with sidebar layout
  app: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Left sidebar - fixed
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
    transition: 'background-color 0.15s',
  },
  navIcon: {
    fontSize: '18px',
  },

  // Main content area - full width minus sidebar
  main: {
    flex: 1,
    marginLeft: '240px',
    padding: '0',
    backgroundColor: '#fafafa',
  },

  // Top bar - full width
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

  // Cards grid - full width with padding
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    padding: '32px 40px',
  },

  // Card styling - cleaner, more modern
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

  // Badges instead of icons
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

  // Card values
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

  // Card footer
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChange: {
    fontSize: '13px',
    color: '#9ca3af',
  },

  // Loading state
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

export default App