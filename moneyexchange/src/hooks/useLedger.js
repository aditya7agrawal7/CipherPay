import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'rupeeflow-ledger';

// Sample seed data so the ledger feels populated
const SEED_TRANSACTIONS = [
  {
    id: 'tx_98a72b1',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    usdcAmount: 250.00,
    inrAmount: 20980.00,
    rate: 83.92,
    network: 'Polygon',
    payoutType: 'UPI',
    payoutTarget: 'rajesh.verma@okaxis',
    status: 'COMPLETED',
    txHash: '0x3a4b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    utr: 'UTR849204910283',
    fees: { network: 0.15, exchange: 1.25, processing: 0.50 }
  },
  {
    id: 'tx_63b92c4',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    usdcAmount: 1200.00,
    inrAmount: 100680.00,
    rate: 83.90,
    network: 'Base',
    payoutType: 'Bank Account',
    payoutTarget: 'HDFC Bank - 50100491827364',
    status: 'COMPLETED',
    txHash: '0xf5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4',
    utr: 'UTR930284910284',
    fees: { network: 0.05, exchange: 6.00, processing: 0.50 }
  },
  {
    id: 'tx_12c98d5',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    usdcAmount: 75.00,
    inrAmount: 0,
    rate: 83.95,
    network: 'Solana',
    payoutType: 'UPI',
    payoutTarget: 'priya.sharma@paytm',
    status: 'FAILED',
    txHash: '4zW9mN8xQy1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z',
    error: 'Simulation Error: Gas limit exceeded on Solana chain.',
    fees: { network: 0.02, exchange: 0.38, processing: 0.50 }
  },
  {
    id: 'tx_44d21ef',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    usdcAmount: 500.00,
    inrAmount: 41950.00,
    rate: 83.90,
    network: 'Polygon',
    payoutType: 'Bank Account',
    payoutTarget: 'ICICI Bank - 000405001234',
    status: 'COMPLETED',
    txHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    utr: 'UTR772039485710',
    fees: { network: 0.15, exchange: 2.50, processing: 0.50 }
  },
  {
    id: 'tx_77f33aa',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    usdcAmount: 2000.00,
    inrAmount: 167700.00,
    rate: 83.85,
    network: 'Ethereum',
    payoutType: 'Bank Account',
    payoutTarget: 'SBI - 30123456789',
    status: 'COMPLETED',
    txHash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    utr: 'UTR551827364910',
    fees: { network: 8.50, exchange: 10.00, processing: 0.50 }
  },
  {
    id: 'tx_88g44bb',
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    usdcAmount: 150.00,
    inrAmount: 12585.00,
    rate: 83.90,
    network: 'Base',
    payoutType: 'UPI',
    payoutTarget: 'amit.kumar@gpay',
    status: 'COMPLETED',
    txHash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    utr: 'UTR330918273645',
    fees: { network: 0.05, exchange: 0.75, processing: 0.50 }
  }
];

export function useLedger() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_TRANSACTIONS;
  });

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Add a new transaction to the ledger
  const addTransaction = useCallback((tx) => {
    const newTx = {
      id: tx.id || 'tx_' + Math.random().toString(36).substr(2, 7),
      timestamp: tx.timestamp || new Date().toISOString(),
      usdcAmount: tx.usdcAmount || 0,
      inrAmount: tx.inrAmount || 0,
      rate: tx.rate || 0,
      network: tx.network || 'Unknown',
      payoutType: tx.payoutType || 'UPI',
      payoutTarget: tx.payoutTarget || '',
      status: tx.status || 'PENDING',
      txHash: tx.txHash || '',
      utr: tx.utr || '',
      fees: tx.fees || { network: 0, exchange: 0, processing: 0 },
      error: tx.error || null
    };
    setTransactions(prev => [newTx, ...prev]);
    return newTx.id;
  }, []);

  // Update an existing transaction (e.g. when status changes)
  const updateTransaction = useCallback((id, updates) => {
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  }, []);

  // Remove a transaction
  const removeTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  }, []);

  // Clear all transactions
  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  // Export transactions as CSV
  const exportCSV = useCallback(() => {
    const headers = ['ID', 'Date', 'USDC Amount', 'INR Amount', 'Rate', 'Network', 'Payout Type', 'Payout Target', 'Status', 'Tx Hash', 'UTR', 'Network Fee', 'Exchange Fee', 'Processing Fee'];
    const rows = transactions.map(tx => [
      tx.id,
      new Date(tx.timestamp).toLocaleString('en-IN'),
      tx.usdcAmount.toFixed(2),
      tx.inrAmount.toFixed(2),
      tx.rate.toFixed(4),
      tx.network,
      tx.payoutType,
      tx.payoutTarget,
      tx.status,
      tx.txHash,
      tx.utr || '',
      tx.fees?.network?.toFixed(2) || '0',
      tx.fees?.exchange?.toFixed(2) || '0',
      tx.fees?.processing?.toFixed(2) || '0'
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rupeeflow-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  // --- Computed Report Stats ---
  const report = useMemo(() => {
    const completed = transactions.filter(tx => tx.status === 'COMPLETED');
    const failed = transactions.filter(tx => tx.status === 'FAILED');
    const pending = transactions.filter(tx => tx.status === 'PENDING');

    const totalVolumeUsdc = completed.reduce((sum, tx) => sum + tx.usdcAmount, 0);
    const totalVolumeInr = completed.reduce((sum, tx) => sum + tx.inrAmount, 0);
    const totalFeesUsdc = completed.reduce((sum, tx) => sum + (tx.fees?.network || 0) + (tx.fees?.exchange || 0) + (tx.fees?.processing || 0), 0);

    const avgTxSize = completed.length > 0 ? totalVolumeUsdc / completed.length : 0;
    const avgRate = completed.length > 0
      ? completed.reduce((sum, tx) => sum + tx.rate, 0) / completed.length
      : 0;

    const successRate = transactions.length > 0
      ? ((completed.length / transactions.length) * 100).toFixed(1)
      : '0.0';

    // Volume by network
    const byNetwork = {};
    completed.forEach(tx => {
      if (!byNetwork[tx.network]) byNetwork[tx.network] = { count: 0, usdc: 0, inr: 0 };
      byNetwork[tx.network].count += 1;
      byNetwork[tx.network].usdc += tx.usdcAmount;
      byNetwork[tx.network].inr += tx.inrAmount;
    });

    // Volume by payout type
    const byPayoutType = {};
    completed.forEach(tx => {
      if (!byPayoutType[tx.payoutType]) byPayoutType[tx.payoutType] = { count: 0, usdc: 0, inr: 0 };
      byPayoutType[tx.payoutType].count += 1;
      byPayoutType[tx.payoutType].usdc += tx.usdcAmount;
      byPayoutType[tx.payoutType].inr += tx.inrAmount;
    });

    // Daily volume (last 7 days)
    const dailyVolume = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayLabel = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      const dayTxs = completed.filter(tx => tx.timestamp.slice(0, 10) === dateStr);
      dailyVolume.push({
        date: dateStr,
        label: dayLabel,
        count: dayTxs.length,
        usdc: dayTxs.reduce((s, tx) => s + tx.usdcAmount, 0),
        inr: dayTxs.reduce((s, tx) => s + tx.inrAmount, 0)
      });
    }

    // Monthly summary
    const monthlyVolume = {};
    completed.forEach(tx => {
      const month = tx.timestamp.slice(0, 7); // YYYY-MM
      if (!monthlyVolume[month]) monthlyVolume[month] = { count: 0, usdc: 0, inr: 0 };
      monthlyVolume[month].count += 1;
      monthlyVolume[month].usdc += tx.usdcAmount;
      monthlyVolume[month].inr += tx.inrAmount;
    });

    // Top recipients
    const recipientMap = {};
    completed.forEach(tx => {
      const key = tx.payoutTarget;
      if (!recipientMap[key]) recipientMap[key] = { count: 0, usdc: 0, inr: 0, type: tx.payoutType };
      recipientMap[key].count += 1;
      recipientMap[key].usdc += tx.usdcAmount;
      recipientMap[key].inr += tx.inrAmount;
    });
    const topRecipients = Object.entries(recipientMap)
      .map(([target, data]) => ({ target, ...data }))
      .sort((a, b) => b.usdc - a.usdc)
      .slice(0, 5);

    return {
      totalTransactions: transactions.length,
      completedCount: completed.length,
      failedCount: failed.length,
      pendingCount: pending.length,
      totalVolumeUsdc,
      totalVolumeInr,
      totalFeesUsdc,
      avgTxSize,
      avgRate,
      successRate,
      byNetwork,
      byPayoutType,
      dailyVolume,
      monthlyVolume,
      topRecipients
    };
  }, [transactions]);

  return {
    transactions,
    report,
    addTransaction,
    updateTransaction,
    removeTransaction,
    clearAllTransactions,
    exportCSV
  };
}
