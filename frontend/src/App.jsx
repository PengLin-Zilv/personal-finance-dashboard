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

  // Sort categories by amount (highest to lowest)
  const sortedCategories = [...data.category_breakdown]
    .sort((a, b) => b.amount - a.amount)

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

      {/* Main content */}
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

        {/* Content area with scroll */}
        <div style={styles.content}>
          {/* Stats cards */}
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

          {/* NEW: Category Breakdown Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Spending by Category</h3>
              <span style={styles.sectionSubtitle}>
                {sortedCategories.length} categories
              </span>
            </div>

            {/* Category list */}
            <div style={styles.categoryList}>
              {sortedCategories.map((category, index) => {
                const percentage = ((category.amount / data.total_spending) * 100).toFixed(1)
                
                return (
                  <div key={index} style={styles.categoryItem}>
                    {/* Left: Category name and amount */}
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
                      
                      {/* Progress bar */}
                      <div style={styles.progressBarContainer}>
                        <div 
                          style={{
                            ...styles.progressBar,
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Right: Percentage */}
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

// Updated styles with category breakdown
const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Sidebar styles (unchanged)
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

  // Main content
  main: {
    flex: 1,
    marginLeft: '240px',
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
  },

  // Top bar (unchanged)
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

  // NEW: Scrollable content area
  content: {
    padding: '32px 40px',
    overflowY: 'auto',
  },

  // Cards grid
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '32px',
  },

  // Card styles (unchanged)
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
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChange: {
    fontSize: '13px',
    color: '#9ca3af',
  },

  // NEW: Section container
  section: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
  },

  // NEW: Section header
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

  // NEW: Category list
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // NEW: Individual category item
  categoryItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },

  // NEW: Left side (name, amount, progress bar)
  categoryLeft: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  // NEW: Category info (name + amount)
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

  // NEW: Progress bar container
  progressBarContainer: {
    height: '8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    overflow: 'hidden',
  },

  // NEW: Progress bar fill
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },

  // NEW: Right side (percentage)
  categoryRight: {
    minWidth: '60px',
    textAlign: 'right',
  },
  percentage: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
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