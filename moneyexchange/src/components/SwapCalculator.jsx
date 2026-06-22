import React, { useState, useEffect } from 'react';
import { ArrowDown, DollarSign, ArrowRightLeft, Info, HelpCircle, Check, Loader2, Sparkles } from 'lucide-react';

const NETWORKS = [
  { id: 'Base', name: 'Base (Lowest Fee)', fee: 0.05, speed: '~30s', color: '#0052ff' },
  { id: 'Polygon', name: 'Polygon', fee: 0.15, speed: '~1m', color: '#8247e5' },
  { id: 'Solana', name: 'Solana', fee: 0.02, speed: '~15s', color: '#14f195' },
  { id: 'Arbitrum', name: 'Arbitrum One', fee: 0.10, speed: '~45s', color: '#28a0f0' },
  { id: 'Ethereum', name: 'Ethereum Mainnet', fee: 8.50, speed: '~2m', color: '#627eea' }
];

export default function SwapCalculator({
  walletConnected,
  usdcBalance,
  exchangeRate,
  beneficiaries,
  activeTx,
  isSwapping,
  startOffRamp,
  clearActiveTx,
  connectWallet
}) {
  const [network, setNetwork] = useState('Base');
  const [usdcAmount, setUsdcAmount] = useState('100');
  const [inrAmount, setInrAmount] = useState('0');
  const [payoutType, setPayoutType] = useState('UPI'); // UPI or Bank
  
  // UPI Form Details
  const [upiId, setUpiId] = useState('');
  
  // Bank Form Details
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');

  // Input Validations
  const [errors, setErrors] = useState({});

  const selectedNet = NETWORKS.find(n => n.id === network);
  const netFee = selectedNet ? selectedNet.fee : 0.10;
  
  // Computations
  const usdcVal = parseFloat(usdcAmount) || 0;
  const platformFee = parseFloat((usdcVal * 0.005).toFixed(2)); // 0.5% exchange fee
  const impsFee = 0.50; // flat $0.50 transfer fee
  const totalFeesUsdc = netFee + platformFee + impsFee;
  const netUsdc = Math.max(0, usdcVal - totalFeesUsdc);
  const calculatedInr = parseFloat((netUsdc * exchangeRate).toFixed(2));

  // Sync inputs
  useEffect(() => {
    setInrAmount(calculatedInr.toFixed(2));
  }, [usdcAmount, exchangeRate, network]);

  const selectBeneficiary = (b) => {
    setPayoutType(b.type);
    if (b.type === 'UPI') {
      setUpiId(b.value);
    } else {
      // Parse bank string like "ICICI Bank - 000405001234 (IFSC: ICIC0000004)"
      const parts = b.value.split(' - ');
      setBankName(parts[0] || 'ICICI Bank');
      
      const subparts = parts[1] ? parts[1].split(' (IFSC: ') : [];
      setAccountNumber(subparts[0] || '');
      setIfscCode(subparts[1] ? subparts[1].replace(')', '') : '');
      setAccountName(b.name);
    }
  };

  const handleMaxClick = () => {
    if (usdcBalance > 0) {
      setUsdcAmount(usdcBalance.toString());
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (usdcVal <= 0) {
      tempErrors.amount = "Enter a valid USDC amount.";
    } else if (usdcVal > usdcBalance) {
      tempErrors.amount = `Insufficient balance. Max is ${usdcBalance} USDC.`;
    } else if (usdcVal < 5) {
      tempErrors.amount = "Minimum cashout is 5 USDC.";
    }

    if (payoutType === 'UPI') {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiId) {
        tempErrors.upi = "UPI ID is required.";
      } else if (!upiRegex.test(upiId)) {
        tempErrors.upi = "Invalid UPI ID format (example: name@upi).";
      }
    } else {
      if (!accountName) tempErrors.name = "Account holder name is required.";
      if (!accountNumber) tempErrors.account = "Account number is required.";
      if (accountNumber && accountNumber.length < 9) tempErrors.account = "Account number is too short.";
      
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscCode) {
        tempErrors.ifsc = "IFSC code is required.";
      } else if (!ifscRegex.test(ifscCode.toUpperCase())) {
        tempErrors.ifsc = "Invalid IFSC format (e.g. SBIN0000123).";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!walletConnected) {
      connectWallet();
      return;
    }
    if (!validate()) return;

    const target = payoutType === 'UPI' 
      ? upiId 
      : `${bankName} - ${accountNumber} (IFSC: ${ifscCode.toUpperCase()})`;
    
    startOffRamp(usdcAmount, payoutType, target, network);
  };

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Outer Card wrapper */}
      <div className="glass-card glow-border" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--color-secondary)' }} />
            Swap USDC to INR
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Powered by Instant IMPS</span>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Network Selector */}
          <div className="input-group">
            <div className="input-label">
              <span>Select Blockchain Network</span>
              <span style={{ color: selectedNet?.color, fontWeight: '600' }}>Speed: {selectedNet?.speed}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
              {NETWORKS.map(net => (
                <button
                  type="button"
                  key={net.id}
                  onClick={() => setNetwork(net.id)}
                  style={{
                    padding: '0.5rem 0.25rem',
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: network === net.id ? net.color : 'var(--border-glass)',
                    background: network === net.id ? `rgba(${parseInt(net.color.substring(1,3), 16) || 99}, ${parseInt(net.color.substring(3,5), 16) || 102}, ${parseInt(net.color.substring(5,7), 16) || 241}, 0.15)` : 'rgba(0,0,0,0.15)',
                    color: network === net.id ? 'var(--text-main)' : 'var(--text-secondary)',
                    fontWeight: network === net.id ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  {net.id}
                </button>
              ))}
            </div>
          </div>

          {/* From USDC Input */}
          <div className="input-group">
            <div className="input-label">
              <span>Send (USDC)</span>
              {walletConnected && (
                <span onClick={handleMaxClick} style={{ cursor: 'pointer', color: 'var(--color-primary)', fontWeight: '600' }}>
                  Max: {usdcBalance.toFixed(2)} USDC
                </span>
              )}
            </div>
            <div className="input-container">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={usdcAmount}
                onChange={e => setUsdcAmount(e.target.value)}
                className="input-field"
                disabled={isSwapping}
                required
              />
              <span className="input-addon">
                <img src="/src/favicon.svg" alt="" style={{ width: '18px', height: '18px' }} />
                USDC
              </span>
            </div>
            {errors.amount && <span style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.amount}</span>}
          </div>

          {/* Exchange Rate Divider Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.5rem 0 0.5rem 0', position: 'relative', zIndex: 1 }}>
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              borderRadius: '50%',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifycontent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <ArrowDown size={14} />
            </div>
          </div>

          {/* To INR Output */}
          <div className="input-group">
            <div className="input-label">
              <span>Receive (INR - Estimated)</span>
              <span>1 USDC = ₹{exchangeRate.toFixed(2)}</span>
            </div>
            <div className="input-container" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <input
                type="text"
                readOnly
                value={inrAmount}
                className="input-field"
                style={{ cursor: 'default', color: 'var(--accent-emerald)' }}
              />
              <span className="input-addon" style={{ color: 'var(--accent-emerald)' }}>
                ₹ INR
              </span>
            </div>
          </div>

          {/* Quick Beneficiaries Selectors */}
          {beneficiaries.length > 0 && (
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Quick Beneficiaries:</span>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', whiteSpace: 'nowrap' }}>
                {beneficiaries.slice(0, 3).map(b => (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => selectBeneficiary(b)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      borderRadius: '9999px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {b.name} ({b.type})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payout Channels Tab Switcher */}
          <div className="tabs-container">
            <button
              type="button"
              className={`tab-btn ${payoutType === 'UPI' ? 'active' : ''}`}
              onClick={() => setPayoutType('UPI')}
              disabled={isSwapping}
            >
              UPI Transfer
            </button>
            <button
              type="button"
              className={`tab-btn ${payoutType === 'Bank' ? 'active' : ''}`}
              onClick={() => setPayoutType('Bank')}
              disabled={isSwapping}
            >
              Bank Transfer (IMPS)
            </button>
          </div>

          {/* Conditional Forms */}
          {payoutType === 'UPI' ? (
            <div className="input-group">
              <label className="input-label">Enter UPI ID (VPA)</label>
              <div className="input-container">
                <input
                  type="text"
                  placeholder="e.g. name@okaxis"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="input-field"
                  disabled={isSwapping}
                  required
                />
              </div>
              {errors.upi && <span style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.upi}</span>}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Instant routing to any UPI app (GPay, PhonePe, Paytm).
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Bank Name</label>
                  <div className="input-container" style={{ padding: '0.5rem 0.75rem' }}>
                    <select
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      className="input-field"
                      style={{ fontSize: '0.9rem', width: '100%', background: 'transparent', border: 'none' }}
                      disabled={isSwapping}
                    >
                      <option value="State Bank of India">SBI</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Punjab National Bank">PNB</option>
                    </select>
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">IFSC Code</label>
                  <div className="input-container" style={{ padding: '0.5rem 0.75rem' }}>
                    <input
                      type="text"
                      placeholder="e.g. ICIC0000004"
                      value={ifscCode}
                      onChange={e => setIfscCode(e.target.value)}
                      className="input-field"
                      style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}
                      disabled={isSwapping}
                      required
                    />
                  </div>
                </div>
              </div>
              {errors.ifsc && <span style={{ color: 'var(--accent-rose)', fontSize: '0.8rem' }}>{errors.ifsc}</span>}

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Account Number</label>
                <div className="input-container">
                  <input
                    type="password"
                    placeholder="Enter Account Number"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="input-field"
                    disabled={isSwapping}
                    required
                  />
                </div>
                {errors.account && <span style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.account}</span>}
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Account Holder Name</label>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Full Name as per bank records"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    className="input-field"
                    disabled={isSwapping}
                    required
                  />
                </div>
                {errors.name && <span style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name}</span>}
              </div>
            </div>
          )}

          {/* Fee details panel */}
          <div style={{
            background: 'rgba(0,0,0,0.15)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.825rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Network fee ({network}):</span>
              <span>{netFee.toFixed(2)} USDC</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Exchange fee (0.5%):</span>
              <span>{platformFee.toFixed(2)} USDC</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>IMPS Transfer Fee:</span>
              <span>{impsFee.toFixed(2)} USDC</span>
            </div>
            <hr style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: '0.2rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: 'var(--text-main)' }}>
              <span>Total Deducted Fees:</span>
              <span>{totalFeesUsdc.toFixed(2)} USDC</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSwapping}
          >
            {!walletConnected ? (
              <span>Connect Wallet to Swap</span>
            ) : isSwapping ? (
              <>
                <Loader2 className="spin-anim" size={18} />
                Processing Swaps...
              </>
            ) : (
              <>
                <ArrowRightLeft size={18} />
                Confirm Off-Ramp
              </>
            )}
          </button>
        </form>
      </div>

      {/* activeTx Stepper Overlay Modal */}
      {activeTx && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ padding: '2rem', border: '1px solid var(--border-glass-hover)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Transaction Status
              </h4>
              <span className={`badge ${activeTx.status === 'COMPLETED' ? 'badge-success' : 'badge-processing pulse-anim'}`}>
                {activeTx.status === 'COMPLETED' ? 'Completed' : 'Processing'}
              </span>
            </div>

            {/* Cashout Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              background: 'var(--bg-input)',
              padding: '1rem',
              borderRadius: 'var(--border-radius-sm)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-glass)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Swapping</span>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>{activeTx.usdcAmount} USDC</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                <ArrowRightLeft size={16} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receiving</span>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-emerald)' }}>₹{activeTx.inrAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Stepper Steps */}
            <div className="stepper-container">
              {activeTx.steps.map(step => (
                <div key={step.key} className={`step-row ${step.status}`}>
                  <div className="step-indicator">
                    {step.status === 'completed' ? (
                      <Check size={14} />
                    ) : step.status === 'active' ? (
                      <Loader2 className="spin-anim" size={14} />
                    ) : (
                      <span>•</span>
                    )}
                  </div>
                  <div className="step-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="step-title">{step.title}</span>
                      {step.status === 'active' && step.progress > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                          ({step.progress}%)
                        </span>
                      )}
                    </div>
                    <span className="step-desc">{step.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Block confirmations bar */}
            {activeTx.status !== 'COMPLETED' && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ height: '4px', background: 'var(--border-glass)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: 'var(--gradient-rainbow)',
                    width: `${activeTx.steps.reduce((acc, curr) => curr.status === 'completed' ? acc + 25 : (curr.status === 'active' ? acc + (curr.progress / 4) : acc), 0)}%`,
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
              </div>
            )}

            {/* Receipts Details if complete */}
            {activeTx.status === 'COMPLETED' && (
              <div style={{
                marginTop: '1.5rem',
                borderTop: '1px solid var(--border-glass)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Bank UTR (Reference):</span>
                  <strong style={{ color: 'var(--text-main)' }}>{activeTx.utr}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tx Hash (Explorer):</span>
                  <a
                    href={`https://polygonscan.com/tx/${activeTx.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--color-primary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px', whiteSpace: 'nowrap' }}
                  >
                    {activeTx.txHash.substring(0, 16)}...
                  </a>
                </div>
                
                <button
                  onClick={clearActiveTx}
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem', padding: '0.6rem' }}
                >
                  Close Receipt
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
