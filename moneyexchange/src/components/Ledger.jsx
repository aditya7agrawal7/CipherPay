import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, ExternalLink,
  Download, X, ChevronLeft, ChevronRight, Calendar,
  TrendingUp, BarChart3, PieChart, Wallet, ArrowRightLeft,
  Trash2, AlertTriangle, Clock, CheckCircle2, XCircle
} from 'lucide-react';

const TABS = [
  { key: 'TRANSACTIONS', label: 'Transactions', icon: ArrowRightLeft },
  { key: 'REPORTS', label: 'Reports', icon: BarChart3 }
];

const STATUS_FILTERS = ['ALL', 'COMPLETED', 'FAILED', 'PENDING'];
const NETWORK_FILTERS = ['All', 'Polygon', 'Base', 'Ethereum', 'Solana', 'Arbitrum'];
const ITEMS_PER_PAGE = 8;

export default function Ledger({ transactions, report, clearAllTransactions, exportCSV }) {
  const [activeTab, setActiveTab] = useState('TRANSACTIONS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [networkFilter, setNetworkFilter] = useState('All');
  const [dateRange, setDateRange] = useState('ALL'); // ALL, 7D, 30D, 90D
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, highest, lowest
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtered and sorted transactions
  const filteredTxs = useMemo(() => {
    let result = [...transactions];

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(tx => tx.status === statusFilter);
    }

    // Network filter
    if (networkFilter !== 'All') {
      result = result.filter(tx => tx.network === networkFilter);
    }

    // Date range filter
    if (dateRange !== 'ALL') {
      const now = new Date();
      const days = dateRange === '7D' ? 7 : dateRange === '30D' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      result = result.filter(tx => new Date(tx.timestamp) >= cutoff);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx =>
        tx.id.toLowerCase().includes(q) ||
        tx.payoutTarget.toLowerCase().includes(q) ||
        tx.network.toLowerCase().includes(q) ||
        tx.txHash?.toLowerCase().includes(q) ||
        tx.utr?.toLowerCase().includes(q) ||
        tx.usdcAmount.toString().includes(q)
      );
    }

    // Sort
    switch (sortOrder) {
      case 'newest':
        result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case 'highest':
        result.sort((a, b) => b.usdcAmount - a.usdcAmount);
        break;
      case 'lowest':
        result.sort((a, b) => a.usdcAmount - b.usdcAmount);
        break;
    }

    return result;
  }, [transactions, statusFilter, networkFilter, dateRange, searchQuery, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTxs.length / ITEMS_PER_PAGE);
  const paginatedTxs = filteredTxs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, networkFilter, dateRange, searchQuery, sortOrder]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={14} />;
      case 'FAILED': return <XCircle size={14} />;
      case 'PENDING': return <Clock size={14} />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'var(--accent-emerald)';
      case 'FAILED': return 'var(--accent-rose)';
      case 'PENDING': return 'var(--accent-indigo)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'COMPLETED': return 'rgba(16, 185, 129, 0.1)';
      case 'FAILED': return 'rgba(244, 63, 94, 0.1)';
      case 'PENDING': return 'rgba(99, 102, 241, 0.1)';
      default: return 'rgba(255,255,255,0.05)';
    }
  };

  return (
    <div className="fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: '9999px',
          padding: '0.3rem 0.8rem',
          marginBottom: '0.75rem',
          fontSize: '0.72rem',
          fontWeight: '600',
          color: 'var(--accent-indigo)'
        }}>
          <BarChart3 size={12} />
          Financial Ledger
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
          Transaction Ledger
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Complete history and analytics of all your off-ramp transactions
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="tabs-container">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={14} style={{ marginRight: '0.3rem' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== TRANSACTIONS TAB ===== */}
      {activeTab === 'TRANSACTIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.1rem' }}>
                {filteredTxs.length}
              </p>
            </div>
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success</span>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-emerald)', marginTop: '0.1rem' }}>
                {filteredTxs.filter(t => t.status === 'COMPLETED').length}
              </p>
            </div>
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Failed</span>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-rose)', marginTop: '0.1rem' }}>
                {filteredTxs.filter(t => t.status === 'FAILED').length}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div className="input-container" style={{ flex: 1, minWidth: '180px', padding: '0.4rem 0.75rem', borderRadius: '10px' }}>
              <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
              <input
                type="text"
                placeholder="Search TX ID, UPI, hash..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Filter Row */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status filter */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.7rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: statusFilter === s ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: statusFilter === s ? 'var(--text-main)' : 'var(--text-secondary)',
                    fontWeight: statusFilter === s ? '600' : '400',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                    transition: 'all 0.15s'
                  }}
                >
                  {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Network filter */}
            <select
              value={networkFilter}
              onChange={e => setNetworkFilter(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '0.35rem 0.6rem',
                color: 'var(--text-main)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-family)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {NETWORK_FILTERS.map(n => (
                <option key={n} value={n}>{n === 'All' ? 'All Networks' : n}</option>
              ))}
            </select>

            {/* Date range */}
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '0.35rem 0.6rem',
                color: 'var(--text-main)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-family)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="ALL">All Time</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
            </select>

            {/* Sort */}
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '0.35rem 0.6rem',
                color: 'var(--text-main)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-family)',
                cursor: 'pointer',
                outline: 'none',
                marginLeft: 'auto'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          {/* Transaction List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {paginatedTxs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--border-radius-sm)'
              }}>
                <Search size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No transactions match your filters</p>
              </div>
            ) : (
              paginatedTxs.map(tx => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--border-radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--border-glass-hover)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-glass)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Left: Status icon + Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', flex: 1 }}>
                    <div style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: getStatusBg(tx.status),
                      color: getStatusColor(tx.status),
                      flexShrink: 0
                    }}>
                      {getStatusIcon(tx.status)}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)' }}>{tx.id}</span>
                        <span style={{
                          fontSize: '0.58rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          background: getStatusBg(tx.status),
                          color: getStatusColor(tx.status)
                        }}>
                          {tx.status.toLowerCase()}
                        </span>
                        <span style={{
                          fontSize: '0.58rem',
                          fontWeight: '600',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.04)',
                          color: 'var(--text-muted)'
                        }}>
                          {tx.network}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '250px',
                        marginTop: '0.1rem'
                      }}>
                        {tx.payoutType}: {tx.payoutTarget}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amounts + Date */}
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.75rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block' }}>
                      -{tx.usdcAmount.toFixed(2)} USDC
                    </strong>
                    {tx.status === 'COMPLETED' ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '600', display: 'block' }}>
                        +₹{tx.inrAmount.toLocaleString('en-IN')}
                      </span>
                    ) : tx.status === 'FAILED' ? (
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-rose)', display: 'block' }}>Failed</span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-indigo)', display: 'block' }}>Pending</span>
                    )}
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.1rem', display: 'block' }}>
                      {new Date(tx.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  padding: '0.35rem',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  padding: '0.35rem',
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={exportCSV} className="btn btn-secondary" style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem' }}>
              <Download size={14} />
              Export CSV
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                flex: 1,
                padding: '0.55rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                background: 'rgba(244, 63, 94, 0.05)',
                color: 'var(--accent-rose)',
                cursor: 'pointer',
                fontFamily: 'var(--font-family)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* ===== REPORTS TAB ===== */}
      {activeTab === 'REPORTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Volume</span>
              <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {report.totalVolumeUsdc.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
              </p>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>
                ₹{report.totalVolumeInr.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Fees</span>
              <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {report.totalFeesUsdc.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
              </p>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                ~₹{(report.totalFeesUsdc * report.avgRate).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success Rate</span>
              <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                {report.successRate}%
              </p>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {report.completedCount} of {report.totalTransactions}
              </span>
            </div>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Tx Size</span>
              <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {report.avgTxSize.toFixed(2)} USDC
              </p>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Avg Rate: ₹{report.avgRate.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Daily Volume Chart */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
              Daily Volume (Last 7 Days)
            </h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.35rem', height: '120px' }}>
              {report.dailyVolume.map((day, i) => {
                const maxUsdc = Math.max(...report.dailyVolume.map(d => d.usdc), 1);
                const heightPct = (day.usdc / maxUsdc) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      {day.usdc > 0 ? `${day.usdc.toFixed(0)}` : ''}
                    </span>
                    <div style={{
                      width: '100%',
                      height: `${Math.max(heightPct, 4)}%`,
                      background: day.usdc > 0
                        ? 'linear-gradient(to top, var(--color-primary), var(--color-secondary))'
                        : 'var(--border-glass)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: '4px'
                    }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Network Breakdown */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PieChart size={14} style={{ color: 'var(--color-primary)' }} />
              Volume by Network
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(report.byNetwork).sort(([,a], [,b]) => b.usdc - a.usdc).map(([network, data]) => {
                const maxNet = Math.max(...Object.values(report.byNetwork).map(d => d.usdc), 1);
                const pct = (data.usdc / maxNet) * 100;
                return (
                  <div key={network}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-main)' }}>{network}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {data.count} txs · {data.usdc.toFixed(2)} USDC
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-glass)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                        borderRadius: '3px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(report.byNetwork).length === 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No completed transactions yet</p>
              )}
            </div>
          </div>

          {/* Payout Type Breakdown */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wallet size={14} style={{ color: 'var(--color-primary)' }} />
              Volume by Payout Type
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {Object.entries(report.byPayoutType).map(([type, data]) => (
                <div key={type} style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.85rem',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{type}</span>
                  <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.15rem' }}>
                    {data.usdc.toFixed(2)} USDC
                  </p>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)' }}>
                    {data.count} transactions
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Recipients */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={14} style={{ color: 'var(--color-primary)' }} />
              Top Recipients
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {report.topRecipients.map((r, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.75rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    flexShrink: 0
                  }}>
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-main)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.target}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {r.type} · {r.count} txs
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-main)', flexShrink: 0 }}>
                    {r.usdc.toFixed(2)} USDC
                  </span>
                </div>
              ))}
              {report.topRecipients.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No data available</p>
              )}
            </div>
          </div>

          {/* Export Button */}
          <button onClick={exportCSV} className="btn btn-primary" style={{ padding: '0.65rem' }}>
            <Download size={15} />
            Download Full Report (CSV)
          </button>
        </div>
      )}

      {/* ===== TRANSACTION DETAIL MODAL ===== */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="glass-card modal-content" style={{ padding: '1.75rem' }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Transaction Details
              </h4>
              <button
                onClick={() => setSelectedTx(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  padding: '0.3rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Status Banner */}
            <div style={{
              background: getStatusBg(selectedTx.status),
              border: `1px solid ${getStatusColor(selectedTx.status)}20`,
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'center',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: getStatusColor(selectedTx.status) }}>
                {getStatusIcon(selectedTx.status)}
                <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>{selectedTx.status}</span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.3rem' }}>
                -{selectedTx.usdcAmount.toFixed(2)} USDC
              </p>
              {selectedTx.status === 'COMPLETED' && (
                <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--accent-emerald)' }}>
                  +₹{selectedTx.inrAmount.toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Detail Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
              <DetailRow label="Transaction ID" value={selectedTx.id} />
              <DetailRow label="Date & Time" value={new Date(selectedTx.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />
              <DetailRow label="Network" value={selectedTx.network} />
              <DetailRow label="Exchange Rate" value={`1 USDC = ₹${selectedTx.rate.toFixed(4)}`} />
              <DetailRow label="Payout Type" value={selectedTx.payoutType} />
              <DetailRow label="Payout Target" value={selectedTx.payoutTarget} />
              
              {selectedTx.utr && <DetailRow label="Bank UTR" value={selectedTx.utr} highlight />}

              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: '0.2rem 0' }} />
              
              <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Fee Breakdown</span>
              <DetailRow label="Network Fee" value={`${selectedTx.fees?.network?.toFixed(2) || '0.00'} USDC`} />
              <DetailRow label="Exchange Fee (0.5%)" value={`${selectedTx.fees?.exchange?.toFixed(2) || '0.00'} USDC`} />
              <DetailRow label="Processing Fee" value={`${selectedTx.fees?.processing?.toFixed(2) || '0.00'} USDC`} />
              <DetailRow
                label="Total Fees"
                value={`${((selectedTx.fees?.network || 0) + (selectedTx.fees?.exchange || 0) + (selectedTx.fees?.processing || 0)).toFixed(2)} USDC`}
                highlight
              />

              {selectedTx.error && (
                <div style={{
                  marginTop: '0.4rem',
                  padding: '0.6rem',
                  background: 'rgba(244,63,94,0.06)',
                  border: '1px solid rgba(244,63,94,0.15)',
                  borderRadius: '8px',
                  color: 'var(--accent-rose)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.4rem'
                }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  {selectedTx.error}
                </div>
              )}
            </div>

            {/* Tx Hash Link */}
            {selectedTx.txHash && (
              <div style={{
                marginTop: '1rem',
                background: 'rgba(0,0,0,0.15)',
                padding: '0.6rem 0.85rem',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Blockchain Hash:</span>
                <a
                  href={`https://polygonscan.com/tx/${selectedTx.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}
                >
                  <span>{selectedTx.txHash.substring(0, 10)}...{selectedTx.txHash.substring(selectedTx.txHash.length - 6)}</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setSelectedTx(null)}
              className="btn btn-secondary"
              style={{ marginTop: '1.25rem', padding: '0.6rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===== CLEAR ALL CONFIRM MODAL ===== */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="glass-card modal-content" style={{ padding: '1.75rem', maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--accent-rose)'
              }}>
                <Trash2 size={22} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Clear All Transactions?
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                This will permanently delete all {transactions.length} transactions from your ledger. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.6rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { clearAllTransactions(); setShowClearConfirm(false); }}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: 'var(--border-radius-sm)',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--accent-rose), #e11d48)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(244, 63, 94, 0.3)'
                  }}
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for detail rows
function DetailRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{
        color: highlight ? 'var(--accent-indigo)' : 'var(--text-main)',
        fontWeight: highlight ? '600' : '500',
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'right'
      }}>
        {value}
      </span>
    </div>
  );
}
