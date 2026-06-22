import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, ExternalLink, Calendar, Check, Download, X } from 'lucide-react';

export default function TransactionHistory({ transactions }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState(null);
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);

  const filteredTxs = transactions.filter(tx => {
    // Search query matching
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      tx.id.toLowerCase().includes(query) ||
      tx.payoutTarget.toLowerCase().includes(query) ||
      tx.usdcAmount.toString().includes(query) ||
      (tx.utr && tx.utr.toLowerCase().includes(query));

    // Status matching
    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'FAILED': return 'badge-failed';
      case 'PENDING': return 'badge-pending pulse-anim';
      default: return 'badge-processing';
    }
  };

  const handleDownloadReceipt = () => {
    setReceiptDownloaded(true);
    setTimeout(() => setReceiptDownloaded(false), 2000);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
          Transaction History
        </h4>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {filteredTxs.length} Transactions
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div className="input-container" style={{ flex: 1, minWidth: '180px', padding: '0.4rem 0.75rem', borderRadius: '6px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
          <input
            type="text"
            placeholder="Search TX ID, UPI, UTR..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ fontSize: '0.85rem' }}
          />
        </div>
        
        {/* Status Dropdown */}
        <div className="input-container" style={{ minWidth: '120px', padding: '0.4rem 0.5rem', borderRadius: '6px' }}>
          <Filter size={14} style={{ color: 'var(--text-secondary)', marginRight: '0.4rem' }} />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ fontSize: '0.85rem', width: '100%', background: 'transparent', border: 'none' }}
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
        {filteredTxs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No transactions found matching filters.
          </div>
        ) : (
          filteredTxs.map(tx => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-glass-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
            >
              
              {/* Left Side: Stats and Target */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifycontent: 'center',
                  background: tx.status === 'FAILED' ? 'rgba(244,63,94,0.12)' : 'rgba(16,185,129,0.12)',
                  color: tx.status === 'FAILED' ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                }}>
                  {tx.status === 'FAILED' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{tx.id}</span>
                    <span className={`badge ${getStatusBadgeClass(tx.status)}`} style={{ padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>
                      {tx.status.toLowerCase()}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    To: {tx.payoutTarget}
                  </span>
                </div>
              </div>

              {/* Right Side: Amounts & Dates */}
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  -{tx.usdcAmount.toFixed(2)} USDC
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '500' }}>
                  +₹{tx.inrAmount.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {new Date(tx.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Transaction Detail Overlay Modal */}
      {selectedTx && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ padding: '2rem', border: '1px solid var(--border-glass-hover)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Transfer Receipt
              </h4>
              <button 
                onClick={() => { setSelectedTx(null); setReceiptDownloaded(false); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Frame */}
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '1.5rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'relative'
            }}>
              {/* Receipt status watermark */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-15deg)',
                fontSize: '2.5rem',
                fontWeight: '900',
                color: selectedTx.status === 'COMPLETED' ? 'rgba(16,185,129,0.04)' : 'rgba(244,63,94,0.04)',
                pointerEvents: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.2em'
              }}>
                {selectedTx.status}
              </div>

              {/* Top Summary */}
              <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border-glass)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Off-Ramp Transaction</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  ₹{selectedTx.inrAmount.toLocaleString('en-IN')}
                </h3>
                <span className={`badge ${getStatusBadgeClass(selectedTx.status)}`} style={{ marginTop: '0.4rem' }}>
                  {selectedTx.status}
                </span>
              </div>

              {/* Breakdown Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Transaction ID:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{selectedTx.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Date &amp; Time:</span>
                  <span style={{ color: 'var(--text-main)' }}>
                    {new Date(selectedTx.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Source Chain:</span>
                  <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {selectedTx.network}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Swapped Amount:</span>
                  <span style={{ color: 'var(--text-main)' }}>{selectedTx.usdcAmount.toFixed(2)} USDC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Exchange Rate:</span>
                  <span style={{ color: 'var(--text-main)' }}>1 USDC = ₹{selectedTx.rate.toFixed(2)}</span>
                </div>
                
                <hr style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: '0.2rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Payout Target ({selectedTx.payoutType}):</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedTx.payoutTarget}
                  </span>
                </div>

                {selectedTx.utr && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Bank Reference UTR:</span>
                    <strong style={{ color: 'var(--accent-indigo)' }}>{selectedTx.utr}</strong>
                  </div>
                )}
                
                {selectedTx.error && (
                  <div style={{
                    marginTop: '0.4rem',
                    padding: '0.5rem',
                    background: 'rgba(244,63,94,0.08)',
                    border: '1px solid rgba(244,63,94,0.2)',
                    borderRadius: '4px',
                    color: 'var(--accent-rose)',
                    fontSize: '0.75rem'
                  }}>
                    {selectedTx.error}
                  </div>
                )}
              </div>

              {/* Explorer block hash */}
              {selectedTx.txHash && (
                <div style={{
                  background: 'rgba(0,0,0,0.15)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Explorer Hash:</span>
                  <a
                    href={`https://polygonscan.com/tx/${selectedTx.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <span>{selectedTx.txHash.substring(0, 10)}...{selectedTx.txHash.substring(selectedTx.txHash.length - 8)}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

            </div>

            {/* Receipt Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={handleDownloadReceipt}
                className="btn btn-primary"
                style={{ padding: '0.6rem', fontSize: '0.85rem' }}
                disabled={selectedTx.status !== 'COMPLETED'}
              >
                {receiptDownloaded ? (
                  <>
                    <Check size={14} />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    Download PDF
                  </>
                )}
              </button>
              <button
                onClick={() => { setSelectedTx(null); setReceiptDownloaded(false); }}
                className="btn btn-secondary"
                style={{ padding: '0.6rem', fontSize: '0.85rem' }}
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
