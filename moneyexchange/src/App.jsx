import React, { useState, useEffect, useCallback } from 'react';
import { t } from './i18n';
import RateChart from './components/RateChart';
import Ledger from './components/Ledger';
import WalletModal from './components/WalletModal';
import NetworkBadges from './components/NetworkBadges';
import { useLedger } from './hooks/useLedger';
import * as StellarSdk from '@stellar/freighter-api';
import { 
  ArrowRight, 
  QrCode, 
  Keyboard, 
  Copy, 
  Check, 
  Loader2, 
  ChevronLeft, 
  ArrowRightLeft, 
  ShieldCheck, 
  ExternalLink,
  Sun,
  Moon,
  Wallet,
  Globe,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('rupeeflow-theme') || 'dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('rupeeflow-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Wallet state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('');

  // Language preference
  const [language, setLanguage] = useState('EN');
  const languages = [
    { code: 'EN', label: 'English' },
    { code: 'HI', label: 'हिन्दी' },
    { code: 'ES', label: 'Español' },
    { code: 'FR', label: 'Français' },
    { code: 'DE', label: 'Deutsch' },
  ];

  // Navigation Screens: 'INPUT' | 'PAYMENT_METHODS' | 'SIMULATION' | 'SUCCESS' | 'LEDGER'
  const [screen, setScreen] = useState('INPUT');

  // Ledger
  const { transactions: ledgerTransactions, report: ledgerReport, addTransaction: addLedgerTx, removeTransaction: removeLedgerTx, clearAllTransactions: clearLedger, exportCSV: exportLedgerCSV } = useLedger();
  
  // Conversion state
  const [usdcAmount, setUsdcAmount] = useState('100');
  const [exchangeRate, setExchangeRate] = useState(83.94);
  const [copied, setCopied] = useState(false);
  
  // Payment option: 'QR' | 'MANUAL' | 'WALLET'
  const [paymentOption, setPaymentOption] = useState('QR');

  // Wallet Pay state
  const [walletPayAmount, setWalletPayAmount] = useState('');
  const [walletPayUpi, setWalletPayUpi] = useState('');
  const [walletPayLoading, setWalletPayLoading] = useState(false);

  // Add Tokens state
  const [addTokensOpen, setAddTokensOpen] = useState(false);
  const [addTokensAmount, setAddTokensAmount] = useState('');
  const [addTokensLoading, setAddTokensLoading] = useState(false);

  // Payout details (Option B)
  const [payoutType, setPayoutType] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountName, setAccountName] = useState('');
  const [txHash, setTxHash] = useState('');

  // Form errors
  const [errors, setErrors] = useState({});

  // Stepper state
  const [stepperProgress, setStepperProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [utrNumber, setUtrNumber] = useState('');
  const [generatedTxHash, setGeneratedTxHash] = useState('');

  // Live rate state (CoinGecko)
  const [rateHistory, setRateHistory] = useState([]);
  const [rateLoading, setRateLoading] = useState(true);
  const [rateError, setRateError] = useState(null);
  const [xlmRate, setXlmRate] = useState(0);

  const fetchLiveRate = useCallback(async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,stellar&vs_currencies=inr',
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const newRate = json?.['usd-coin']?.inr;
      const newXlmRate = json?.['stellar']?.inr;
      if (!newRate) throw new Error('Rate missing');
      const rounded = parseFloat(newRate.toFixed(4));
      setExchangeRate(rounded);
      if (newXlmRate) setXlmRate(parseFloat(newXlmRate.toFixed(4)));
      const now = new Date();
      const label = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setRateHistory(prev => [...prev, { label, value: rounded, time: now.toISOString() }].slice(-60));
      setRateError(null);
    } catch (err) {
      setRateError(err.message);
      setExchangeRate(prev => {
        const delta = (Math.random() - 0.5) * 0.06;
        const next = parseFloat((prev + delta).toFixed(4));
        const clamped = Math.min(Math.max(next, 82.0), 88.0);
        const now = new Date();
        const label = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setRateHistory(p => [...p, { label, value: clamped, time: now.toISOString() }].slice(-60));
        return clamped;
      });
    } finally {
      setRateLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveRate();
    const interval = setInterval(fetchLiveRate, 60_000);
    return () => clearInterval(interval);
  }, [fetchLiveRate]);

  // Compute conversion
  const usdcVal = parseFloat(usdcAmount) || 0;
  const platformFee = parseFloat((usdcVal * 0.005).toFixed(2)); // 0.5% exchange markup
  const netUsdc = Math.max(0, usdcVal - platformFee - 0.50); // deduct $0.50 IMPS handling
  const estimatedInr = parseFloat((netUsdc * exchangeRate).toFixed(2));

  // Copy mock deposit address
  const depositAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate a mock txhash for manual entry convenience
  const handleGenerateMockTx = () => {
    const randomHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setTxHash(randomHash);
  };

  // Validate manual inputs
  const validateManualForm = () => {
    const tempErrors = {};
    if (payoutType === 'UPI') {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiId.trim() || !upiRegex.test(upiId)) {
        tempErrors.upiId = t(language, 'errUpi');
      }
    } else {
      if (!accountName.trim()) tempErrors.accountName = t(language, 'errName');
      if (!accountNumber.trim() || accountNumber.length < 9) tempErrors.accountNumber = t(language, 'errAccountNum');
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifsc.trim() || !ifscRegex.test(ifsc.toUpperCase())) {
        tempErrors.ifsc = t(language, 'errIfsc');
      }
    }

    if (!txHash.trim() || !txHash.startsWith('0x') || txHash.length < 20) {
      tempErrors.txHash = t(language, 'errTxHash');
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Trigger deposit processing simulation
  const handleStartSimulation = () => {
    if (paymentOption === 'MANUAL' && !validateManualForm()) {
      return;
    }

    // Deduct from wallet if Stellar is connected
    if (selectedWallet === 'stellar' && walletConnected) {
      const xlmNeeded = xlmRate > 0 ? (usdcVal * exchangeRate) / xlmRate : 0;
      const currentBalance = parseFloat(walletBalance) || 0;

      if (xlmNeeded > currentBalance) {
        setErrors({ walletInsufficient: t(language, 'walletInsufficient') });
        return;
      }

      setErrors({});
      setWalletBalance((currentBalance - xlmNeeded).toFixed(4));
    }

    setScreen('SIMULATION');
    setActiveStep(0);
    setStepperProgress(0);

    const mockHash = txHash || '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setGeneratedTxHash(mockHash);

    // Step 1: Wallet confirm / Tx validation (2s)
    setTimeout(() => {
      setActiveStep(1);
      setStepperProgress(33);

      // Step 2: Swap conversion / Liquidity locking (2s)
      setTimeout(() => {
        setActiveStep(2);
        setStepperProgress(66);

        // Step 3: IMPS dispatching (2.5s)
        setTimeout(() => {
          const mockUtr = 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
          setUtrNumber(mockUtr);
          setActiveStep(3);
          setStepperProgress(100);

          // Success transition (1s)
          setTimeout(() => {
            // Add completed transaction to the ledger
            const platformFee = parseFloat((usdcVal * 0.005).toFixed(2));
            const xlmDeducted = xlmRate > 0 ? (usdcVal * exchangeRate) / xlmRate : 0;
            addLedgerTx({
              id: 'tx_' + Math.random().toString(36).substr(2, 7),
              timestamp: new Date().toISOString(),
              usdcAmount: usdcVal,
              inrAmount: estimatedInr,
              rate: exchangeRate,
              network: selectedWallet === 'stellar' ? 'Stellar' : 'Polygon',
              payoutType: payoutType,
              payoutTarget: payoutType === 'UPI' ? upiId : `${accountName} (${accountNumber.slice(-4)})`,
              status: 'COMPLETED',
              txHash: mockHash,
              utr: mockUtr,
              fees: { network: selectedWallet === 'stellar' ? 0.00001 : 0.15, exchange: platformFee, processing: 0.50 },
              xlmDeducted: selectedWallet === 'stellar' ? parseFloat(xlmDeducted.toFixed(4)) : null
            });
            setScreen('SUCCESS');
          }, 1000);

        }, 2500);
      }, 2000);
    }, 2000);
  };

  const handleReset = () => {
    setScreen('INPUT');
    setUsdcAmount('100');
    setTxHash('');
    setErrors({});
  };

  const handleConnectWallet = () => {
    setWalletModalOpen(true);
  };

  const STELLAR_PUBLIC_KEY = 'GCCEWLQGWN4EQGXKF4QEZFH6J6QEEOYYCVQEYXXK43KCMCUXRWB42DGN';

  const handleWalletSelect = async (walletId) => {
    setSelectedWallet(walletId);

    let address = '';

    if (walletId === 'stellar') {
      try {
        const connected = await StellarSdk.isConnected();
        if (connected) {
          address = await StellarSdk.getPublicKey();
        } else {
          address = STELLAR_PUBLIC_KEY;
        }
      } catch {
        address = STELLAR_PUBLIC_KEY;
      }
    } else {
      address = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    }

    setWalletAddress(address);
    setWalletConnected(true);
    setWalletModalOpen(false);
    setShowWalletDropdown(false);

    if (walletId === 'stellar') fetchStellarBalance(address);
  };

  const fetchStellarBalance = async (publicKey) => {
    setBalanceLoading(true);
    try {
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`);
      const data = await res.json();
      const native = data?.balances?.find(b => b.asset_type === 'native');
      setWalletBalance(native ? parseFloat(native.balance).toFixed(4) : '0.0000');
    } catch {
      setWalletBalance('0.0000');
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setWalletBalance(null);
    setSelectedWallet('');
    setShowWalletDropdown(false);
    setAddTokensOpen(false);
    setAddTokensAmount('');
  };

  const handleAddTokens = async () => {
    const amount = parseFloat(addTokensAmount);
    if (!amount || amount <= 0) return;

    setAddTokensLoading(true);

    try {
      const keypairs = StellarSdk.Keypair.fromPublicKey(walletAddress);
      const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

      try {
        await server.loadAccount(walletAddress);
      } catch {
        const friendbotUrl = `https://friendbot.stellar.org/?addr=${walletAddress}`;
        await fetch(friendbotUrl);
        await new Promise(r => setTimeout(r, 2000));
      }

      const currentBalance = parseFloat(walletBalance) || 0;
      setWalletBalance((currentBalance + amount).toFixed(4));

      setAddTokensAmount('');
      setAddTokensOpen(false);
    } catch {
      const currentBalance = parseFloat(walletBalance) || 0;
      setWalletBalance((currentBalance + amount).toFixed(4));
      setAddTokensAmount('');
      setAddTokensOpen(false);
    } finally {
      setAddTokensLoading(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const getWalletName = (walletId) => {
    const names = { solana: 'Solana', celo: 'Celo', stellar: 'Stellar' };
    return names[walletId] || '';
  };

  const handleWalletPay = () => {
    const amount = parseFloat(walletPayAmount) || 0;
    const balance = parseFloat(walletBalance) || 0;

    if (amount <= 0 || amount > balance) return;
    if (!walletPayUpi.trim() || !/^[\w.-]+@[\w.-]+$/.test(walletPayUpi)) {
      setErrors({ walletPayUpi: t(language, 'upiError') });
      return;
    }

    setErrors({});
    setWalletPayLoading(true);

    setTimeout(() => {
      setWalletPayLoading(false);
      const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const mockUtr = 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);

      addLedgerTx({
        id: 'tx_' + Math.random().toString(36).substr(2, 7),
        timestamp: new Date().toISOString(),
        usdcAmount: amount,
        inrAmount: parseFloat((amount * xlmRate).toFixed(2)),
        rate: xlmRate,
        network: 'Stellar',
        payoutType: 'UPI',
        payoutTarget: walletPayUpi,
        status: 'COMPLETED',
        txHash: mockHash,
        utr: mockUtr,
        fees: { network: 0.00001, exchange: 0, processing: 0 }
      });

      setWalletBalance((balance - amount).toFixed(4));
      setScreen('SUCCESS');
      setWalletPayAmount('');
      setWalletPayUpi('');
    }, 2500);

    setScreen('SIMULATION');
    setActiveStep(0);
    setStepperProgress(0);

    setTimeout(() => {
      setActiveStep(1);
      setStepperProgress(33);
      setTimeout(() => {
        setActiveStep(2);
        setStepperProgress(66);
        setTimeout(() => {
          setActiveStep(3);
          setStepperProgress(100);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  return (
    <>
      {/* Background decorations */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="glow-orb"></div>
      </div>

      {/* Wallet Selection Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onSelect={handleWalletSelect}
      />

      {/* Main app grid */}
      <div className="app-wrapper">
        
        {/* Top Panel: Company name, language preferences, theme toggle, wallet */}
        <div className="top-panel">
          <div className="top-panel-left">
            <ArrowRightLeft size={20} style={{ color: 'var(--color-primary)' }} />
            <span className="top-panel-brand">RupeeFlow</span>
          </div>

          <div className="top-panel-right">
            {/* Ledger Button */}
            <button
              onClick={() => setScreen(screen === 'LEDGER' ? 'INPUT' : 'LEDGER')}
              className="btn-secondary"
              style={{
                padding: '0.4rem',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                background: screen === 'LEDGER' ? 'rgba(99, 102, 241, 0.1)' : undefined,
                borderColor: screen === 'LEDGER' ? 'rgba(99, 102, 241, 0.3)' : undefined,
                color: screen === 'LEDGER' ? 'var(--color-primary)' : undefined,
                position: 'relative'
              }}
              title="Transaction Ledger"
            >
              <BookOpen size={16} />
              {ledgerTransactions.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-emerald)',
                  border: '2px solid var(--bg-base)',
                  boxShadow: '0 0 6px var(--accent-emerald)'
                }}></span>
              )}
            </button>

            {/* Language Selector */}
            <div className="lang-selector">
              <Globe size={14} style={{ color: 'var(--text-secondary)' }} />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="lang-dropdown"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="btn-secondary theme-toggle-btn"
              aria-label="Toggle light and dark mode"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Wallet Connect / Status */}
            <div className="wallet-wrapper">
              {walletConnected ? (
                <>
                  <button
                    onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                    className="btn-secondary wallet-connected-btn"
                  >
                    <div className="wallet-dot"></div>
                    <span>{getWalletName(selectedWallet)} {formatAddress(walletAddress)}</span>
                  </button>
                  {showWalletDropdown && (
                    <div className="glass-card wallet-dropdown">
                      <span className="wallet-dropdown-label">{t(language, 'connected')}</span>

                      {selectedWallet === 'stellar' && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0',
                          fontSize: '0.8rem'
                        }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Balance</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                              {balanceLoading ? '...' : `${walletBalance ?? '—'} XLM`}
                            </span>
                            <button
                              onClick={() => fetchStellarBalance(walletAddress)}
                              disabled={balanceLoading}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                opacity: balanceLoading ? 0.5 : 1
                              }}
                              title="Refresh balance"
                            >
                              <Loader2 size={12} className={balanceLoading ? 'spin' : ''} />
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedWallet === 'stellar' && (
                        <button
                          onClick={() => setAddTokensOpen(!addTokensOpen)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.75rem',
                            background: 'rgba(20, 182, 231, 0.08)',
                            border: '1px solid rgba(20, 182, 231, 0.2)',
                            borderRadius: '8px',
                            color: '#14B6E7',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-family)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
                          {t(language, 'addTokens')}
                        </button>
                      )}

                      {addTokensOpen && selectedWallet === 'stellar' && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          padding: '0.5rem 0',
                          animation: 'fadeIn 0.2s ease'
                        }}>
                          <input
                            type="number"
                            placeholder={t(language, 'addTokensAmount')}
                            value={addTokensAmount}
                            onChange={e => setAddTokensAmount(e.target.value)}
                            min="0"
                            step="0.0001"
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.7rem',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-glass)',
                              borderRadius: '8px',
                              color: 'var(--text-main)',
                              fontSize: '0.82rem',
                              fontFamily: 'var(--font-family)',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={handleAddTokens}
                              disabled={addTokensLoading || !addTokensAmount || parseFloat(addTokensAmount) <= 0}
                              style={{
                                flex: 1,
                                padding: '0.4rem',
                                background: '#14B6E7',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-family)',
                                opacity: addTokensLoading || !addTokensAmount ? 0.6 : 1
                              }}
                            >
                              {addTokensLoading ? '...' : t(language, 'addTokensAdd')}
                            </button>
                            <button
                              onClick={() => { setAddTokensOpen(false); setAddTokensAmount(''); }}
                              style={{
                                padding: '0.4rem 0.6rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '6px',
                                color: 'var(--text-secondary)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-family)'
                              }}
                            >
                              {t(language, 'addTokensCancel')}
                            </button>
                          </div>
                        </div>
                      )}

                      <hr style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: '0.4rem 0' }} />
                      <button onClick={handleDisconnectWallet} className="wallet-disconnect-btn">
                        {t(language, 'disconnect')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={handleConnectWallet} className="btn btn-primary wallet-connect-btn">
                  <Wallet size={16} />
                  {t(language, 'connectWallet')}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* State 1: Input conversion view */}
        {screen === 'INPUT' && (
          <div className="fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Headline */}
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: '9999px',
                padding: '0.3rem 0.8rem',
                marginBottom: '1rem',
                fontSize: '0.72rem',
                fontWeight: '600',
                color: 'var(--accent-indigo)'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 6px var(--accent-emerald)', animation: 'pulse-dot 2s ease-in-out infinite' }}></span>
                Live Exchange Rate
              </div>
              <h2 className="hero-title">{t(language, 'heroTitle')}</h2>
              <p className="hero-subtitle">
                {t(language, 'heroSubtitle')}
              </p>
              <NetworkBadges />
            </div>

            <div className="glass-card glow-border" style={{ animation: 'scaleIn 0.4s ease-out' }}>
              
              {/* Send USDC */}
              <div className="input-group">
                <label className="input-label">
                  <span>{t(language, 'youSend')}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Min. 5 USDC</span>
                </label>
                <div className="input-container">
                  <input
                    type="number"
                    value={usdcAmount}
                    onChange={e => setUsdcAmount(e.target.value)}
                    className="input-field"
                    placeholder="0.00"
                    min="5"
                  />
                  <span className="input-addon">
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2775ca, #1a5ba8)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>$</span>
                    USDC
                  </span>
                </div>
                {usdcVal < 5 && usdcAmount !== '' && (
                  <span style={{ color: 'var(--accent-rose)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem' }}>!</span> {t(language, 'minConversion')}
                  </span>
                )}
              </div>

              {/* Exchange rate divider */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.5rem 0', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.8rem',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  border: '3px solid var(--bg-base)'
                }}>
                  <ArrowRight size={14} style={{ transform: 'rotate(90deg)' }} />
                </div>
              </div>

              {/* Receive INR */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">
                  <span>{t(language, 'youReceive')}</span>
                  <span style={{ color: 'var(--accent-indigo)', fontWeight: '600', fontSize: '0.72rem' }}>
                    1 USDC = ₹{exchangeRate.toFixed(2)}
                  </span>
                </label>
                <div className="input-container" style={{ background: 'rgba(16, 185, 129, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <input
                    type="text"
                    value={usdcVal >= 5 ? `₹ ${estimatedInr.toLocaleString('en-IN')}` : '₹ 0.00'}
                    className="input-field"
                    style={{ color: 'var(--accent-emerald)', cursor: 'default', fontWeight: '700' }}
                    readOnly
                  />
                  <span className="input-addon" style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>INR</span>
                </div>
              </div>

              {/* Fee info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '0.5rem 0',
                fontSize: '0.7rem',
                color: 'var(--text-muted)'
              }}>
                <span>0.5% fee</span>
                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                <span>$0.50 IMPS</span>
                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                <span>~30s</span>
              </div>

              {/* Primary Action Continue Button */}
              <button
                onClick={() => setScreen('PAYMENT_METHODS')}
                disabled={usdcVal < 5}
                className="btn btn-primary"
                style={{ marginTop: '0.5rem', padding: '0.8rem', fontSize: '0.95rem' }}
              >
                <span>{t(language, 'continue')}</span>
                <ArrowRight size={17} />
              </button>

            </div>

            {/* Live Rate Chart + Converter */}
            <RateChart
              currentRate={exchangeRate}
              rateHistory={rateHistory}
              rateLoading={rateLoading}
              rateError={rateError}
              fetchLiveRate={fetchLiveRate}
            />
          </div>
        )}


        {/* Back button - shown on screens after INPUT */}
        {screen !== 'INPUT' && screen !== 'SUCCESS' && (
          <button 
            onClick={() => {
              if (screen === 'SIMULATION') setScreen('PAYMENT_METHODS');
              else if (screen === 'LEDGER') setScreen('INPUT');
              else setScreen('INPUT');
            }}
            className="back-button"
          >
            <ChevronLeft size={16} />
            {t(language, 'back')}
          </button>
        )}

        {/* Ledger Screen */}
        {screen === 'LEDGER' && (
          <Ledger
            transactions={ledgerTransactions}
            report={ledgerReport}
            removeTransaction={removeLedgerTx}
            clearAllTransactions={clearLedger}
            exportCSV={exportLedgerCSV}
          />
        )}

        {/* State 2: Payment options panel */}
        {screen === 'PAYMENT_METHODS' && (
          <div className="fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
                {t(language, 'chooseDepositMode')}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {t(language, 'selectTransfer', usdcAmount)}
              </p>
            </div>

            {/* Toggle Payment grid */}
            <div className="payment-options-grid">
              
              <div 
                className={`payment-option-card ${paymentOption === 'QR' ? 'selected' : ''}`}
                onClick={() => setPaymentOption('QR')}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: paymentOption === 'QR' ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: paymentOption === 'QR' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                }}>
                  <QrCode size={24} style={{ color: paymentOption === 'QR' ? '#fff' : 'var(--text-muted)' }} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{t(language, 'scanQR')}</strong>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{t(language, 'instantWallet')}</p>
                </div>
              </div>

              <div 
                className={`payment-option-card ${paymentOption === 'MANUAL' ? 'selected' : ''}`}
                onClick={() => setPaymentOption('MANUAL')}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: paymentOption === 'MANUAL' ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: paymentOption === 'MANUAL' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                }}>
                  <Keyboard size={24} style={{ color: paymentOption === 'MANUAL' ? '#fff' : 'var(--text-muted)' }} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{t(language, 'manualEntry')}</strong>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{t(language, 'inputDetails')}</p>
                </div>
              </div>

              {selectedWallet === 'stellar' && walletConnected && (
                <div
                  className={`payment-option-card ${paymentOption === 'WALLET' ? 'selected' : ''}`}
                  onClick={() => setPaymentOption('WALLET')}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: paymentOption === 'WALLET' ? 'linear-gradient(135deg, #14B6E7, #04C3F1)' : 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: paymentOption === 'WALLET' ? '0 4px 12px rgba(20, 182, 231, 0.3)' : 'none'
                  }}>
                    <Wallet size={24} style={{ color: paymentOption === 'WALLET' ? '#fff' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{t(language, 'payWithWallet')}</strong>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {walletBalance ?? '—'} XLM
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Render selected option panel */}
            <div className="glass-card">
              
              {/* OPTION A: QR Code */}
              {paymentOption === 'QR' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                  
                  {/* Mock QR SVG */}
                  <div style={{
                    background: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: '16px',
                    width: '170px',
                    height: '170px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                      {/* Quiet Zone Grid */}
                      <path d="M10,10 h20 v20 h-20 z M10,14 h16 v12 h-16 z" fill="#000" />
                      <path d="M70,10 h20 v20 h-20 z M74,14 h12 v12 h-12 z" fill="#000" />
                      <path d="M10,70 h20 v20 h-20 z M14,74 h12 v12 h-12 z" fill="#000" />
                      
                      {/* Random data squares */}
                      <path d="M40,10 h5 v5 h-5 z M50,15 h10 v5 h-10 z M60,10 h5 v10 h-5 z M45,25 h10 v5 h-10 z" fill="#000" />
                      <path d="M10,40 h15 v5 h-15 z M30,40 h10 v5 h-10 z M50,40 h5 v10 h-5 z M60,35 h15 v5 h-15 z" fill="#000" />
                      <path d="M35,50 h15 v5 h-15 z M15,55 h10 v5 h-10 z M25,60 h5 v10 h-5 z M45,65 h10 v5 h-10 z" fill="#000" />
                      <path d="M70,45 h10 v5 h-10 z M85,50 h5 v15 h-5 z M75,60 h10 v5 h-10 z M80,75 h10 v10 h-10 z" fill="#000" />
                      
                      {/* USDC center logo indicator */}
                      <rect x="38" y="38" width="24" height="24" rx="6" fill="#6366f1" />
                      <text x="50" y="55" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">$</text>
                    </svg>
                  </div>

                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{t(language, 'sendExactly', usdcAmount)}</span>
                    
                    {/* Copyable address box */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '10px',
                      padding: '0.6rem 0.85rem',
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                      gap: '0.5rem',
                      transition: 'border-color 0.2s ease'
                    }}>
                      <code style={{ fontSize: '0.75rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-family)' }}>
                        {depositAddress}
                      </code>
                      <button 
                        onClick={handleCopy}
                        style={{
                          background: copied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.08)',
                          border: 'none',
                          borderRadius: '8px',
                          color: copied ? 'var(--accent-emerald)' : 'var(--color-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.35rem',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                        title="Copy address"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">{t(language, 'destinationUPI')}</label>
                      <div className="input-container">
                        <input
                          type="text"
                          placeholder="e.g. Satoshi@ybl"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      {errors.upiId && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.upiId}</span>}
                    </div>

                    <button 
                      onClick={() => {
                        const upiRegex = /^[\w.-]+@[\w.-]+$/;
                        if (!upiId.trim() || !upiRegex.test(upiId)) {
                          setErrors({ upiId: t(language, 'upiError') });
                          return;
                        }
                        setErrors({});
                        handleStartSimulation();
                      }}
                      className="btn btn-primary"
                    >
                      {t(language, 'confirmPayout')}
                    </button>
                    {errors.walletInsufficient && (
                      <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', textAlign: 'center' }}>{errors.walletInsufficient}</span>
                    )}
                  </div>

                </div>
              )}

              {/* OPTION B: Manual Data Entry */}
              {paymentOption === 'MANUAL' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Destination accounts switches */}
                  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        background: payoutType === 'UPI' ? 'rgba(255,255,255,0.06)' : 'transparent',
                        border: 'none',
                        color: payoutType === 'UPI' ? 'var(--text-main)' : 'var(--text-secondary)',
                        padding: '0.4rem',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-family)',
                        fontWeight: '600'
                      }}
                      onClick={() => setPayoutType('UPI')}
                    >
                      {t(language, 'upiId')}
                    </button>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        background: payoutType === 'Bank' ? 'rgba(255,255,255,0.06)' : 'transparent',
                        border: 'none',
                        color: payoutType === 'Bank' ? 'var(--text-main)' : 'var(--text-secondary)',
                        padding: '0.4rem',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-family)',
                        fontWeight: '600'
                      }}
                      onClick={() => setPayoutType('Bank')}
                    >
                      {t(language, 'bankAccount')}
                    </button>
                  </div>

                  {/* UPI Inputs */}
                  {payoutType === 'UPI' ? (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">{t(language, 'upiId')}</label>
                      <div className="input-container">
                        <input
                          type="text"
                          placeholder="e.g. satellite@upi"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      {errors.upiId && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.upiId}</span>}
                    </div>
                  ) : (
                    // Bank Account details
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">{t(language, 'ifscCode')}</label>
                          <div className="input-container" style={{ padding: '0.5rem 0.75rem' }}>
                            <input
                              type="text"
                              placeholder="HDFC0000001"
                              value={ifsc}
                              onChange={e => setIfsc(e.target.value)}
                              className="input-field"
                              style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}
                            />
                          </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">{t(language, 'holderName')}</label>
                          <div className="input-container" style={{ padding: '0.5rem 0.75rem' }}>
                            <input
                              type="text"
                              placeholder={t(language, 'receiverName')}
                              value={accountName}
                              onChange={e => setAccountName(e.target.value)}
                              className="input-field"
                              style={{ fontSize: '0.9rem' }}
                            />
                          </div>
                        </div>
                      </div>
                      {errors.ifsc && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.ifsc}</span>}
                      {errors.accountName && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.accountName}</span>}

                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">{t(language, 'accountNumber')}</label>
                        <div className="input-container">
                          <input
                            type="password"
                            placeholder={t(language, 'accountNumber')}
                            value={accountNumber}
                            onChange={e => setAccountNumber(e.target.value)}
                            className="input-field"
                          />
                        </div>
                        {errors.accountNumber && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.accountNumber}</span>}
                      </div>
                    </div>
                  )}

                  {/* Manual Hash validation */}
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <div className="input-label">
                      <span>{t(language, 'txHash')}</span>
                      <span onClick={handleGenerateMockTx} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600' }}>
                        {t(language, 'generateMock')}
                      </span>
                    </div>
                    <div className="input-container">
                      <input
                        type="text"
                        placeholder="e.g. 0x3a4b9c8d7e..."
                        value={txHash}
                        onChange={e => setTxHash(e.target.value)}
                        className="input-field"
                        style={{ fontSize: '0.9rem' }}
                      />
                    </div>
                    {errors.txHash && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.txHash}</span>}
                  </div>

                  <button onClick={handleStartSimulation} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    {t(language, 'verifyOffRamp')}
                  </button>
                  {errors.walletInsufficient && (
                    <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', textAlign: 'center' }}>{errors.walletInsufficient}</span>
                  )}

                </div>
              )}

              {/* OPTION C: Wallet Pay */}
              {paymentOption === 'WALLET' && selectedWallet === 'stellar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(20, 182, 231, 0.05)',
                    border: '1px solid rgba(20, 182, 231, 0.15)',
                    borderRadius: '12px'
                  }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t(language, 'walletBalanceLabel')}</span>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: '#14B6E7' }}>
                      {balanceLoading ? '...' : `${walletBalance ?? '0.0000'} XLM`}
                    </span>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">{t(language, 'payAmount')}</label>
                    <div className="input-container">
                      <input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.0001"
                        value={walletPayAmount}
                        onChange={e => setWalletPayAmount(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    {walletPayAmount && parseFloat(walletPayAmount) > parseFloat(walletBalance || 0) && (
                      <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{t(language, 'walletInsufficient')}</span>
                    )}
                  </div>

                  {walletPayAmount && parseFloat(walletPayAmount) > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      fontSize: '0.82rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{t(language, 'payInrEquivalent')}</span>
                      <span style={{ fontWeight: '600', color: 'var(--accent-emerald)' }}>
                        ₹ {(parseFloat(walletPayAmount) * xlmRate).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">{t(language, 'destinationUPI')}</label>
                    <div className="input-container">
                      <input
                        type="text"
                        placeholder="e.g. Satoshi@ybl"
                        value={walletPayUpi}
                        onChange={e => setWalletPayUpi(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    {errors.walletPayUpi && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.walletPayUpi}</span>}
                  </div>

                  <button
                    onClick={handleWalletPay}
                    disabled={
                      walletPayLoading ||
                      !walletPayAmount ||
                      parseFloat(walletPayAmount) <= 0 ||
                      parseFloat(walletPayAmount) > parseFloat(walletBalance || 0)
                    }
                    className="btn btn-primary"
                    style={{ marginTop: '0.5rem', opacity: walletPayLoading ? 0.7 : 1 }}
                  >
                    {walletPayLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Loader2 size={16} className="spin" /> Processing...
                      </span>
                    ) : (
                      t(language, 'payNow')
                    )}
                  </button>

                </div>
              )}

            </div>
          </div>
        )}

        {/* State 3: Stepper processing simulation */}
        {screen === 'SIMULATION' && (
          <div className="fade-in glass-card" style={{ width: '100%', padding: '1.75rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                border: '2px solid rgba(99, 102, 241, 0.2)'
              }}>
                <Loader2 className="spin" size={24} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                {t(language, 'confirmingDeposit')}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {t(language, 'verifyingTx')}
              </p>
            </div>

            {/* Stepper items */}
            <div className="stepper-list">
              
              <div className={`step-item ${activeStep >= 0 ? 'completed' : ''}`}>
                <div className="step-dot">
                  {activeStep > 0 ? '✓' : <Loader2 className="spin" size={12} />}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{t(language, 'txSubmitted')}</strong>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{t(language, 'checkingValidity')}</p>
                </div>
                {activeStep > 0 && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>Done</span>
                )}
              </div>

              <div className={`step-item ${activeStep >= 1 ? (activeStep > 1 ? 'completed' : 'active') : ''}`}>
                <div className="step-dot">
                  {activeStep > 1 ? '✓' : activeStep === 1 ? <Loader2 className="spin" size={12} /> : '2'}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{t(language, 'confirmingNetwork')}</strong>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{t(language, 'validatingBlock')}</p>
                </div>
                {activeStep > 1 && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>Done</span>
                )}
                {activeStep === 1 && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: '600' }}>...</span>
                )}
              </div>

              <div className={`step-item ${activeStep >= 2 ? (activeStep > 2 ? 'completed' : 'active') : ''}`}>
                <div className="step-dot">
                  {activeStep > 2 ? '✓' : activeStep === 2 ? <Loader2 className="spin" size={12} /> : '3'}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{t(language, 'routingPayout')}</strong>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{t(language, 'dispatchingIMPS')}</p>
                </div>
                {activeStep > 2 && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>Done</span>
                )}
              </div>

            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', background: 'var(--border-glass)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                width: `${stepperProgress}%`,
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '4px',
                boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)'
              }}></div>
            </div>
          </div>
        )}

        {/* State 4: Success Receipt */}
        {screen === 'SUCCESS' && (
          <div className="fade-in glass-card" style={{ width: '100%', textAlign: 'center', padding: '2rem 1.5rem' }}>
            
            {/* Animated check circle */}
            <div style={{
              width: '4.5rem',
              height: '4.5rem',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.06)',
              color: 'var(--accent-emerald)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              border: '2px solid var(--accent-emerald)',
              animation: 'checkPop 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
              boxShadow: '0 0 32px rgba(16, 185, 129, 0.2)',
              position: 'relative'
            }}>
              <div className="success-ring"></div>
              <Check size={36} strokeWidth={2.5} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
              {t(language, 'paymentSent')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              {t(language, 'conversionComplete')}
            </p>

            {/* Transfer breakdown */}
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              borderRadius: '14px',
              padding: '1.25rem',
              margin: '1.5rem 0',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t(language, 'exchanged')}</span>
                <strong style={{ color: 'var(--text-main)' }}>{usdcAmount} USDC</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t(language, 'deposited')}</span>
                <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>
                  ₹ {estimatedInr.toLocaleString('en-IN')}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t(language, 'rateApplied')}</span>
                <span style={{ color: 'var(--text-main)' }}>1 USDC = ₹{exchangeRate.toFixed(2)}</span>
              </div>
              
              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: '0.15rem 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t(language, 'payoutTarget')}</span>
                <span style={{ color: 'var(--text-main)', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                  {payoutType === 'UPI' ? upiId : `${accountName} (${accountNumber.slice(-4)})`}
                </span>
              </div>
              {selectedWallet === 'stellar' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Debited from Wallet</span>
                  <span style={{ color: '#14B6E7', fontWeight: '600', fontSize: '0.85rem' }}>
                    {(usdcVal * exchangeRate / xlmRate).toFixed(4)} XLM
                  </span>
                </div>
              )}
              {utrNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t(language, 'bankUTR')}</span>
                  <strong style={{ color: 'var(--accent-indigo)', background: 'rgba(99, 102, 241, 0.08)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}>{utrNumber}</strong>
                </div>
              )}
              {generatedTxHash && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t(language, 'txHashLabel')}</span>
                  <a 
                    href={`https://polygonscan.com/tx/${generatedTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '500', background: 'rgba(99, 102, 241, 0.06)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}
                  >
                    <span>{generatedTxHash.slice(0, 10)}...</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>

            <button onClick={handleReset} className="btn btn-primary" style={{ padding: '0.8rem', fontSize: '0.95rem' }}>
              {t(language, 'makeAnotherPayment')}
            </button>

          </div>
        )}

        {/* Footer compliance */}
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.7rem',
          padding: '0.5rem 0.85rem',
          background: 'rgba(16, 185, 129, 0.03)',
          border: '1px solid rgba(16, 185, 129, 0.06)',
          borderRadius: 'var(--border-radius-sm)',
          width: '100%'
        }}>
          <ShieldCheck size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
          <span>{t(language, 'footerCompliance')}</span>
        </div>

      </div>
    </>
  );
}
