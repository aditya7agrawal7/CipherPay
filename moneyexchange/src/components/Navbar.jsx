import React, { useState } from 'react';
import { Wallet, LogOut, Sun, Moon, ArrowRightLeft, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

export default function Navbar({
  walletConnected,
  walletAddress,
  walletProvider,
  usdcBalance,
  theme,
  toggleTheme,
  exchangeRate,
  rateTrend,
  connectWallet,
  disconnectWallet
}) {
  const [showProviders, setShowProviders] = useState(false);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleConnect = (provider) => {
    connectWallet(provider);
    setShowProviders(false);
  };

  return (
    <header className="glass-card" style={{ padding: '1rem 1.5rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Logo and Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--gradient-rainbow)',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
          }}>
            <ArrowRightLeft size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', background: 'linear-gradient(to right, var(--text-main), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              RupeeFlow
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Instant Crypto Payouts
            </span>
          </div>
        </div>

        {/* Live Rates Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-glass)',
            padding: '0.4rem 0.8rem',
            borderRadius: '9999px',
            fontSize: '0.85rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>Live Rate:</span>
            <strong style={{ color: 'var(--text-main)' }}>1 USDC = ₹{exchangeRate.toFixed(2)}</strong>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              color: rateTrend === 'up' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              fontWeight: '600'
            }}>
              {rateTrend === 'up' ? <TrendingUp size={14} style={{ marginRight: '2px' }} /> : <TrendingDown size={14} style={{ marginRight: '2px' }} />}
              {rateTrend === 'up' ? '+0.04%' : '-0.02%'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="btn-secondary" 
            style={{ padding: '0.5rem', borderRadius: '50%', width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Toggle light and dark mode"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Wallet connection block */}
          {walletConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              
              {/* Balance Badge */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                marginRight: '0.5rem'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Balance</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  {usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                </span>
              </div>

              {/* Connected Button / Dropdown trigger */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowProviders(!showProviders)}
                  className="btn-secondary"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    borderRadius: 'var(--border-radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }}></div>
                  <span>{formatAddress(walletAddress)}</span>
                  <ChevronDown size={14} />
                </button>

                {showProviders && (
                  <div className="glass-card" style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    width: '180px',
                    padding: '0.5rem',
                    borderRadius: 'var(--border-radius-sm)',
                    zIndex: 10,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    background: 'var(--bg-tooltip)',
                    borderColor: 'var(--border-glass-hover)'
                  }}>
                    <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Connected via {walletProvider}
                    </div>
                    <hr style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: '0.4rem 0' }} />
                    <button
                      onClick={disconnectWallet}
                      className="btn"
                      style={{
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.85rem',
                        color: 'var(--accent-rose)',
                        background: 'transparent',
                        justifyContent: 'flex-start',
                        gap: '0.5rem',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={14} />
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProviders(!showProviders)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', borderRadius: 'var(--border-radius-sm)', width: 'auto' }}
              >
                <Wallet size={16} />
                Connect Wallet
              </button>

              {showProviders && (
                <div className="glass-card" style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '220px',
                  padding: '0.5rem',
                  borderRadius: 'var(--border-radius-sm)',
                  zIndex: 10,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  background: 'var(--bg-tooltip)',
                  borderColor: 'var(--border-glass-hover)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Select Wallet Provider
                  </div>
                  <button onClick={() => handleConnect('MetaMask')} className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.85rem', borderRadius: '6px', justifyContent: 'flex-start' }}>
                    <img src="/src/favicon.svg" style={{ width: '16px', height: '16px', filter: 'hue-rotate(45deg)' }} alt="" />
                    MetaMask (Mock)
                  </button>
                  <button onClick={() => handleConnect('Coinbase')} className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.85rem', borderRadius: '6px', justifyContent: 'flex-start' }}>
                    <img src="/src/favicon.svg" style={{ width: '16px', height: '16px', filter: 'hue-rotate(180deg)' }} alt="" />
                    Coinbase Wallet (Mock)
                  </button>
                  <button onClick={() => handleConnect('Phantom')} className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.85rem', borderRadius: '6px', justifyContent: 'flex-start' }}>
                    <img src="/src/favicon.svg" style={{ width: '16px', height: '16px', filter: 'hue-rotate(270deg)' }} alt="" />
                    Phantom (Mock)
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
