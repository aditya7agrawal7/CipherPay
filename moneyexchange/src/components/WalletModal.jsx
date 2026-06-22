import { X } from 'lucide-react';

const wallets = [
  {
    id: 'solana',
    name: 'Solana',
    color: '#9945FF',
    gradient: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <rect width="24" height="24" rx="6" fill="currentColor" opacity="0.1" />
        <path d="M6.5 8.5h11a1 1 0 010 2h-11a1 1 0 010-2z" fill="currentColor" />
        <path d="M6.5 12h11a1 1 0 010 2h-11a1 1 0 010-2z" fill="currentColor" />
        <path d="M6.5 15.5h7a1 1 0 010 2h-7a1 1 0 010-2z" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'celo',
    name: 'Celo',
    color: '#FCFF52',
    darkColor: '#35C759',
    gradient: 'linear-gradient(135deg, #35C759 0%, #FCFF52 100%)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <rect width="24" height="24" rx="6" fill="currentColor" opacity="0.1" />
        <path d="M12 6C8.69 6 6 8.69 6 12s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm2.5 9.5h-5v-1h5v1zm0-2.5h-5v-1h5v1zm0-2.5h-5v-1h5v1z" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'stellar',
    name: 'Stellar',
    color: '#14B6E7',
    gradient: 'linear-gradient(135deg, #14B6E7 0%, #04C3F1 100%)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <rect width="24" height="24" rx="6" fill="currentColor" opacity="0.1" />
        <path d="M12 6l-1.5 6h-3l1.5-6h3zM14.5 12l-1.5 6h-3l1.5-6h3z" fill="currentColor" />
      </svg>
    )
  }
];

export default function WalletModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="glass-card" style={{ padding: '1.75rem', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={16} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              marginBottom: '0.35rem',
              color: 'var(--text-main)'
            }}>
              Choose Your Wallet
            </h3>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)'
            }}>
              Select a blockchain network to connect
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => onSelect(wallet.id)}
                className="wallet-option-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1.5px solid var(--border-glass)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--text-main)'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: wallet.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: wallet.id === 'celo' ? '#1a1a2e' : '#fff',
                  flexShrink: 0,
                  boxShadow: `0 4px 12px ${wallet.color}33`
                }}>
                  {wallet.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    marginBottom: '0.15rem'
                  }}>
                    {wallet.name}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    fontWeight: '400'
                  }}>
                    {wallet.id === 'solana' && 'Fast & low-cost transactions'}
                    {wallet.id === 'celo' && 'Mobile-first blockchain'}
                    {wallet.id === 'stellar' && 'Cross-border payments'}
                  </div>
                </div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: wallet.color,
                  boxShadow: `0 0 8px ${wallet.color}66`
                }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
