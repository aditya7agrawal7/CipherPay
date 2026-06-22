import React, { useState } from 'react';
import { User, Plus, Trash2, ShieldCheck, Check, Globe } from 'lucide-react';

export default function BeneficiaryList({ beneficiaries, addBeneficiary, removeBeneficiary }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('UPI');
  
  // UPI fields
  const [upi, setUpi] = useState('');
  
  // Bank fields
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bank, setBank] = useState('HDFC Bank');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a beneficiary name.');
      return;
    }

    if (type === 'UPI') {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upi.trim() || !upiRegex.test(upi)) {
        setError('Please enter a valid UPI ID (e.g. username@upi).');
        return;
      }
      addBeneficiary(name, 'UPI', upi.trim());
    } else {
      if (!accountNumber.trim() || accountNumber.length < 9) {
        setError('Please enter a valid Account Number (min 9 digits).');
        return;
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifsc.trim() || !ifscRegex.test(ifsc.toUpperCase())) {
        setError('Please enter a valid IFSC code (e.g. HDFC0000012).');
        return;
      }
      const valueStr = `${bank} - ${accountNumber.trim()} (IFSC: ${ifsc.trim().toUpperCase()})`;
      addBeneficiary(name, 'Bank', valueStr);
    }

    // Reset Form
    setName('');
    setUpi('');
    setAccountNumber('');
    setIfsc('');
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowAddForm(false);
    }, 1200);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header and Toggle Form Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Saved Beneficiaries
        </h4>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setError(''); }}
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            borderRadius: '6px',
            background: showAddForm ? 'rgba(244,63,94,0.1)' : 'rgba(99,102,241,0.1)',
            border: '1px solid',
            borderColor: showAddForm ? 'var(--accent-rose)' : 'var(--color-primary)',
            color: showAddForm ? 'var(--accent-rose)' : 'var(--accent-indigo)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontFamily: 'var(--font-family)'
          }}
        >
          {showAddForm ? 'Cancel' : (
            <>
              <Plus size={14} />
              Add New
            </>
          )}
        </button>
      </div>

      {/* Inline Form to Add Beneficiary */}
      {showAddForm && (
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(0,0,0,0.15)',
          border: '1px solid var(--border-glass)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {success ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem 0', color: 'var(--accent-emerald)' }}>
              <Check size={28} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Beneficiary Added!</span>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                {/* Name */}
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Beneficiary Nickname</label>
                  <input
                    type="text"
                    placeholder="e.g. Father, Self"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '6px',
                      padding: '0.4rem 0.6rem',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                    required
                  />
                </div>

                {/* Type Selection */}
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Payout Type</label>
                  <select
                    value={type}
                    onChange={e => { setType(e.target.value); setError(''); }}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '6px',
                      padding: '0.4rem 0.6rem',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank">Bank Account</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Inputs */}
              {type === 'UPI' ? (
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>UPI ID (VPA)</label>
                  <input
                    type="text"
                    placeholder="e.g. mother@okicici"
                    value={upi}
                    onChange={e => setUpi(e.target.value)}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '6px',
                      padding: '0.4rem 0.6rem',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label" style={{ fontSize: '0.75rem' }}>Bank Name</label>
                      <select
                        value={bank}
                        onChange={e => setBank(e.target.value)}
                        style={{
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: '6px',
                          padding: '0.4rem 0.6rem',
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          outline: 'none'
                        }}
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="State Bank of India">SBI</option>
                        <option value="Axis Bank">Axis Bank</option>
                      </select>
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label" style={{ fontSize: '0.75rem' }}>IFSC Code</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC0000011"
                        value={ifsc}
                        onChange={e => setIfsc(e.target.value)}
                        style={{
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: '6px',
                          padding: '0.4rem 0.6rem',
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          outline: 'none',
                          textTransform: 'uppercase'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.75rem' }}>Account Number</label>
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      style={{
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '6px',
                        padding: '0.4rem 0.6rem',
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>
              )}

              {error && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{error}</span>}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.45rem', fontSize: '0.8rem' }}
              >
                Save Account
              </button>
            </>
          )}
        </form>
      )}

      {/* Beneficiaries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
        {beneficiaries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No saved beneficiaries.
          </div>
        ) : (
          beneficiaries.map(b => (
            <div
              key={b.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 0.8rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-glass)',
                borderRadius: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  width: '1.8rem',
                  height: '1.8rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifycontent: 'center',
                  color: 'var(--text-secondary)',
                  flexShrink: 0
                }}>
                  <User size={12} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>{b.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    [{b.type}] {b.value}
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeBeneficiary(b.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifycontent: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-rose)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                aria-label="Delete beneficiary"
              >
                <Trash2 size={14} />
              </button>

            </div>
          ))
        )}
      </div>

      {/* Safety Compliance Footer Badge */}
      <div style={{
        marginTop: '0.5rem',
        padding: '0.6rem 0.75rem',
        borderRadius: '6px',
        background: 'var(--glow-emerald)',
        border: '1px solid rgba(16,185,129,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <ShieldCheck size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
          Bank credentials are fully encrypted and stored locally.
        </span>
      </div>

    </div>
  );
}
