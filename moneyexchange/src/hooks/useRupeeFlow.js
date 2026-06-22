import { useState, useEffect, useCallback } from 'react';

// Sample initial history so the platform feels populated from the start
const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_98a72b1',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36h ago
    usdcAmount: 250.00,
    inrAmount: 20980.00,
    rate: 83.92,
    network: 'Polygon',
    payoutType: 'UPI',
    payoutTarget: 'rajesh.verma@okaxis',
    status: 'COMPLETED',
    txHash: '0x3a4b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    utr: 'UTR849204910283'
  },
  {
    id: 'tx_63b92c4',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8h ago
    usdcAmount: 1200.00,
    inrAmount: 100680.00,
    rate: 83.90,
    network: 'Base',
    payoutType: 'Bank Account',
    payoutTarget: 'HDFC Bank - 50100491827364',
    status: 'COMPLETED',
    txHash: '0xf5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4',
    utr: 'UTR930284910284'
  },
  {
    id: 'tx_12c98d5',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    usdcAmount: 75.00,
    inrAmount: 6296.25,
    rate: 83.95,
    network: 'Solana',
    payoutType: 'UPI',
    payoutTarget: 'priya.sharma@paytm',
    status: 'FAILED',
    txHash: '4zW9mN8xQy1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z',
    error: 'Simulation Error: Gas limit exceeded on Solana chain.'
  }
];

const INITIAL_BENEFICIARIES = [
  { id: 'b_1', name: 'Rajesh Verma (Self)', type: 'UPI', value: 'rajesh.verma@okaxis' },
  { id: 'b_2', name: 'Priya Sharma (Developer)', type: 'UPI', value: 'priya.sharma@paytm' },
  { id: 'b_3', name: 'TechCorp Business Acct', type: 'Bank', value: 'ICICI Bank - 000405001234 (IFSC: ICIC0000004)' }
];

export function useRupeeFlow() {
  // Wallet Connection Simulation
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletProvider, setWalletProvider] = useState(null); // MetaMask, Coinbase, Phantom
  const [usdcBalance, setUsdcBalance] = useState(1450.75); // Starting mock balance
  const [inrBalance, setInrBalance] = useState(2500.00); // Starting INR balance (e.g. from cashout history)
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('rupeeflow-theme') || 'dark';
  });

  // Rates — live from CoinGecko
  const [exchangeRate, setExchangeRate] = useState(83.94);
  const [rateTrend, setRateTrend] = useState('up');
  const [rateHistory, setRateHistory] = useState([]); // { time, value } pairs
  const [rateLoading, setRateLoading] = useState(true);
  const [rateError, setRateError] = useState(null);

  // Saved Beneficiaries
  const [beneficiaries, setBeneficiaries] = useState(() => {
    const saved = localStorage.getItem('rupeeflow-beneficiaries');
    return saved ? JSON.parse(saved) : INITIAL_BENEFICIARIES;
  });

  // Transaction History
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('rupeeflow-transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Active Transaction State Machine
  const [activeTx, setActiveTx] = useState(null); // { id, step, progress, ... }
  const [isSwapping, setIsSwapping] = useState(false);

  // Toggle Theme
  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('rupeeflow-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
      colorSchemeMeta.content = nextTheme === 'dark' ? 'dark light' : 'light dark';
    }
  }, [theme]);

  // Connect / Disconnect Wallet Simulator
  const connectWallet = useCallback((providerName = 'MetaMask') => {
    setIsSwapping(false);
    setWalletConnected(true);
    setWalletProvider(providerName);
    
    let mockAddr = '';
    if (providerName === 'MetaMask') {
      mockAddr = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    } else if (providerName === 'Coinbase') {
      mockAddr = '0x39013904990d0b09320e409b301c201bd30cd03b';
    } else if (providerName === 'Phantom') {
      mockAddr = 'GqT5mN8xQy1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7';
    }
    setWalletAddress(mockAddr);
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletConnected(false);
    setWalletAddress(null);
    setWalletProvider(null);
  }, []);

  // Fetch live USDC → INR rate from CoinGecko
  const fetchLiveRate = useCallback(async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=inr',
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const newRate = json?.['usd-coin']?.inr;
      if (!newRate) throw new Error('Rate missing in response');

      const rounded = parseFloat(newRate.toFixed(4));
      setExchangeRate(prev => {
        setRateTrend(rounded >= prev ? 'up' : 'down');
        return rounded;
      });

      const now = new Date();
      const label = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setRateHistory(prev => {
        const next = [...prev, { label, value: rounded, time: now.toISOString() }];
        return next.slice(-60); // keep last 60 data points
      });

      setRateError(null);
    } catch (err) {
      console.warn('[RupeeFlow] CoinGecko fetch failed:', err.message);
      setRateError(err.message);
      // Fallback: tiny random walk so UI stays alive
      setExchangeRate(prev => {
        const delta = (Math.random() - 0.5) * 0.06;
        const next = parseFloat((prev + delta).toFixed(4));
        setRateTrend(delta >= 0 ? 'up' : 'down');
        const clamped = Math.min(Math.max(next, 82.00), 88.00);
        const now = new Date();
        const label = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setRateHistory(p => {
          const nx = [...p, { label, value: clamped, time: now.toISOString() }];
          return nx.slice(-60);
        });
        return clamped;
      });
    } finally {
      setRateLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveRate(); // immediate fetch on mount
    const interval = setInterval(fetchLiveRate, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchLiveRate]);

  // Save beneficiaries to localStorage
  useEffect(() => {
    localStorage.setItem('rupeeflow-beneficiaries', JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  // Save transactions to localStorage
  useEffect(() => {
    localStorage.setItem('rupeeflow-transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Add Beneficiary
  const addBeneficiary = useCallback((name, type, value) => {
    const newBen = {
      id: 'b_' + Math.random().toString(36).substr(2, 9),
      name,
      type,
      value
    };
    setBeneficiaries(prev => [newBen, ...prev]);
  }, []);

  // Remove Beneficiary
  const removeBeneficiary = useCallback((id) => {
    setBeneficiaries(prev => prev.filter(b => b.id !== id));
  }, []);

  // Trigger Off-Ramp Conversion (Swap)
  const startOffRamp = useCallback(async (usdcAmount, payoutType, payoutTarget, network) => {
    if (!walletConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    if (parseFloat(usdcAmount) > usdcBalance) {
      alert("Insufficient USDC balance in simulated wallet.");
      return;
    }

    setIsSwapping(true);
    const amountVal = parseFloat(usdcAmount);
    const rateVal = exchangeRate;
    const grossInr = amountVal * rateVal;
    
    // Fee calculations
    const networkFees = {
      Ethereum: 8.50,
      Polygon: 0.15,
      Base: 0.05,
      Arbitrum: 0.10,
      Solana: 0.02
    };
    const networkFee = networkFees[network] || 0.10;
    const exchangeFee = parseFloat((amountVal * 0.005).toFixed(2)); // 0.5% exchange fee
    const processingFee = 0.50; // $0.50 IMPS fee
    const totalFeesUsdc = networkFee + exchangeFee + processingFee;
    const finalUsdc = amountVal - totalFeesUsdc;
    const netInr = parseFloat((finalUsdc * rateVal).toFixed(2));

    const txId = 'tx_' + Math.random().toString(36).substr(2, 7);
    const mockTxHash = network === 'Solana' 
      ? '5z' + Math.random().toString(36).substr(2, 12) + 'SolHash'
      : '0x' + Math.random().toString(16).substr(2, 8) + Math.random().toString(16).substr(2, 8) + 'e3b8a92';

    const tempTx = {
      id: txId,
      timestamp: new Date().toISOString(),
      usdcAmount: amountVal,
      inrAmount: netInr,
      rate: rateVal,
      network,
      payoutType,
      payoutTarget,
      status: 'PENDING',
      txHash: mockTxHash,
      steps: [
        { key: 'wallet', title: 'Wallet Authorization', desc: 'Approve USDC spend limit in wallet', status: 'active', progress: 0 },
        { key: 'blockchain', title: 'Blockchain Confirmation', desc: `Broadcasting on ${network} network`, status: 'waiting', progress: 0 },
        { key: 'exchange', title: 'Liquidity Off-Ramp', desc: 'Exchanging USDC for INR fiat reserve', status: 'waiting', progress: 0 },
        { key: 'bank', title: 'IMPS Bank Transfer', desc: `Routing funds to ${payoutType}`, status: 'waiting', progress: 0 }
      ]
    };

    setActiveTx(tempTx);

    // Simulation steps with timers
    // Step 1: Wallet sign (2s)
    setTimeout(() => {
      setActiveTx(prev => {
        if (!prev) return null;
        const nextSteps = prev.steps.map(s => {
          if (s.key === 'wallet') return { ...s, status: 'completed', progress: 100 };
          if (s.key === 'blockchain') return { ...s, status: 'active', desc: 'Confirming blocks (0/15)' };
          return s;
        });
        return { ...prev, steps: nextSteps };
      });

      // Blockchain block confirmation countdown (2.5s)
      let confirmations = 0;
      const confInterval = setInterval(() => {
        confirmations += 3;
        setActiveTx(prev => {
          if (!prev) {
            clearInterval(confInterval);
            return null;
          }
          const nextSteps = prev.steps.map(s => {
            if (s.key === 'blockchain') {
              if (confirmations >= 15) {
                return { ...s, desc: '15/15 blocks confirmed', progress: 100 };
              }
              return { ...s, desc: `Confirming blocks (${confirmations}/15)`, progress: Math.min(100, Math.floor((confirmations / 15) * 100)) };
            }
            return s;
          });
          return { ...prev, steps: nextSteps };
        });

        if (confirmations >= 15) {
          clearInterval(confInterval);
          
          // Proceed to exchange stage
          setTimeout(() => {
            setActiveTx(prev => {
              if (!prev) return null;
              const nextSteps = prev.steps.map(s => {
                if (s.key === 'blockchain') return { ...s, status: 'completed' };
                if (s.key === 'exchange') return { ...s, status: 'active', progress: 50 };
                return s;
              });
              return { ...prev, steps: nextSteps };
            });

            // Liquidity provider offramp (2s)
            setTimeout(() => {
              setActiveTx(prev => {
                if (!prev) return null;
                const nextSteps = prev.steps.map(s => {
                  if (s.key === 'exchange') return { ...s, status: 'completed', progress: 100 };
                  if (s.key === 'bank') return { ...s, status: 'active', progress: 30 };
                  return s;
                });
                return { ...prev, steps: nextSteps };
              });

              // Bank routing processing (2.5s)
              setTimeout(() => {
                const finalUtr = 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
                
                setActiveTx(prev => {
                  if (!prev) return null;
                  const nextSteps = prev.steps.map(s => {
                    if (s.key === 'bank') return { ...s, status: 'completed', progress: 100, desc: `Transferred. UTR: ${finalUtr}` };
                    return s;
                  });
                  return { ...prev, steps: nextSteps, status: 'COMPLETED', utr: finalUtr };
                });

                // Update balances and list
                setUsdcBalance(prev => parseFloat((prev - amountVal).toFixed(2)));
                setInrBalance(prev => parseFloat((prev + netInr).toFixed(2)));

                const newCompletedTx = {
                  id: txId,
                  timestamp: new Date().toISOString(),
                  usdcAmount: amountVal,
                  inrAmount: netInr,
                  rate: rateVal,
                  network,
                  payoutType,
                  payoutTarget,
                  status: 'COMPLETED',
                  txHash: mockTxHash,
                  utr: finalUtr
                };

                setTransactions(prev => [newCompletedTx, ...prev]);
                setIsSwapping(false);

              }, 2500);

            }, 2000);

          }, 1000);
        }
      }, 500);

    }, 2000);

  }, [walletConnected, usdcBalance, exchangeRate]);

  // Cancel Active Tx overlay / Close
  const clearActiveTx = useCallback(() => {
    setActiveTx(null);
  }, []);

  return {
    walletConnected,
    walletAddress,
    walletProvider,
    usdcBalance,
    inrBalance,
    theme,
    toggleTheme,
    exchangeRate,
    rateTrend,
    beneficiaries,
    addBeneficiary,
    removeBeneficiary,
    transactions,
    activeTx,
    isSwapping,
    connectWallet,
    disconnectWallet,
    startOffRamp,
    clearActiveTx,
    rateHistory,
    rateLoading,
    rateError,
    fetchLiveRate
  };
}
