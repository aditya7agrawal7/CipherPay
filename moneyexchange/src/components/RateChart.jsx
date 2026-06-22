import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ArrowUpRight, RefreshCw, Wifi, WifiOff, Zap } from 'lucide-react';

const TIMEFRAMES = ['LIVE', '7D', '30D'];

// Static historical baselines (merged with live data for 7D/30D views)
const BASELINE_DATA = {
  '7D': [
    { label: 'Mon', value: 83.78 },
    { label: 'Tue', value: 83.82 },
    { label: 'Wed', value: 83.89 },
    { label: 'Thu', value: 83.84 },
    { label: 'Fri', value: 83.95 },
    { label: 'Sat', value: 83.92 },
    { label: 'Today', value: null }, // replaced with live rate
  ],
  '30D': [
    { label: 'Day 1',  value: 83.52 },
    { label: 'Day 3',  value: 83.58 },
    { label: 'Day 5',  value: 83.65 },
    { label: 'Day 7',  value: 83.60 },
    { label: 'Day 9',  value: 83.72 },
    { label: 'Day 11', value: 83.68 },
    { label: 'Day 13', value: 83.75 },
    { label: 'Day 15', value: 83.82 },
    { label: 'Day 17', value: 83.80 },
    { label: 'Day 19', value: 83.88 },
    { label: 'Day 21', value: 83.92 },
    { label: 'Day 23', value: 83.87 },
    { label: 'Day 25', value: 83.94 },
    { label: 'Day 27', value: 83.99 },
    { label: 'Today',  value: null }, // replaced with live rate
  ],
};

export default function RateChart({ currentRate, rateHistory = [], rateLoading, rateError, fetchLiveRate }) {
  const [timeframe, setTimeframe] = useState('LIVE');
  const [hoverIndex, setHoverIndex] = useState(null);
  const [usdcInput, setUsdcInput] = useState('100');
  const svgRef = useRef(null);

  // --- Build the dataset to display based on the selected timeframe ---
  const buildData = () => {
    if (timeframe === 'LIVE') {
      // Use accumulated live history; if fewer than 2 points, pad with a baseline
      if (rateHistory.length >= 2) return rateHistory;
      const now = new Date();
      const fallback = [
        { label: 'Start', value: currentRate - 0.05, time: new Date(now - 300000).toISOString() },
        { label: 'Now',   value: currentRate,         time: now.toISOString() },
      ];
      return rateHistory.length === 1 ? [...fallback.slice(0,1), rateHistory[0]] : fallback;
    }
    // For 7D / 30D replace the last "Today" entry with the live rate
    const base = BASELINE_DATA[timeframe].map(d => ({
      ...d,
      value: d.value === null ? currentRate : d.value,
    }));
    return base;
  };

  const data = buildData();

  const values = data.map(d => d.value);
  const minVal = Math.min(...values) - 0.05;
  const maxVal = Math.max(...values) + 0.05;
  const valRange = maxVal - minVal || 0.1;

  // SVG layout
  const W = 500, H = 200;
  const PL = 42, PR = 10, PT = 16, PB = 28;
  const cW = W - PL - PR;
  const cH = H - PT - PB;

  const points = data.map((d, i) => ({
    x: PL + (data.length > 1 ? (i / (data.length - 1)) * cW : cW / 2),
    y: PT + cH - ((d.value - minVal) / valRange) * cH,
    ...d,
  }));

  const pathD = points.length > 1
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';
  const areaD = pathD
    ? `${pathD} L ${points[points.length-1].x} ${PT+cH} L ${points[0].x} ${PT+cH} Z`
    : '';

  const handleMouseMove = (e) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let ci = 0, md = Infinity;
    points.forEach((p, idx) => {
      const d = Math.abs(p.x - mx);
      if (d < md) { md = d; ci = idx; }
    });
    setHoverIndex(ci);
  };

  // Computed stats
  const avgRate   = values.reduce((a, b) => a + b, 0) / values.length;
  const priceChg  = currentRate - values[0];
  const pctChg    = (priceChg / values[0]) * 100;
  const isUp      = priceChg >= 0;

  // Converter
  const usdcVal   = parseFloat(usdcInput) || 0;
  const convertedInr = (usdcVal * currentRate).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Live Converter Widget */}
      <div className="glass-card glow-border" style={{ padding: '1.25rem', animation: 'scaleIn 0.4s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Zap size={12} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)' }}>
            Live USDC → INR Converter
          </span>
          <span className="feat-badge" style={{
            marginLeft: 'auto',
            background: rateError ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
            color: rateError ? 'var(--accent-rose)' : 'var(--accent-emerald)',
          }}>
            {rateError ? <WifiOff size={9} /> : <Wifi size={9} />}
            {rateError ? 'Offline (est.)' : 'CoinGecko Live'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.6rem', alignItems: 'center' }}>
          {/* USDC input */}
          <div className="input-container" style={{ padding: '0.6rem 0.75rem' }}>
            <input
              type="number"
              min="0"
              step="any"
              value={usdcInput}
              onChange={e => setUsdcInput(e.target.value)}
              className="input-field"
              placeholder="0.00"
              style={{ fontWeight: '600', fontSize: '1rem' }}
            />
            <span className="input-addon" style={{ fontWeight: '700', fontSize: '0.82rem' }}>USDC</span>
          </div>

          {/* Arrow */}
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '0.8rem', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            border: '2px solid var(--bg-base)'
          }}>→</div>

          {/* INR output */}
          <div className="input-container" style={{ background: 'rgba(16,185,129,0.03)', borderColor: 'rgba(16,185,129,0.15)', padding: '0.6rem 0.75rem' }}>
            <input
              type="text"
              readOnly
              value={rateLoading ? 'Loading...' : `₹ ${parseFloat(convertedInr).toLocaleString('en-IN')}`}
              className="input-field"
              style={{ color: 'var(--accent-emerald)', cursor: 'default', fontWeight: '700', fontSize: '0.95rem' }}
            />
            <span className="input-addon" style={{ color: 'var(--accent-emerald)', fontWeight: '700', fontSize: '0.82rem' }}>INR</span>
          </div>
        </div>

        {/* Rate pill + refresh */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.65rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {rateLoading
              ? 'Fetching live rate...'
              : `1 USDC = ₹${currentRate.toFixed(4)} · Updated ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
            }
          </span>
          <button
            onClick={fetchLiveRate}
            style={{
              background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.1)',
              borderRadius: '8px', padding: '0.25rem 0.5rem',
              color: 'var(--color-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.68rem', transition: 'all 0.2s',
              fontFamily: 'var(--font-family)', fontWeight: '500'
            }}
            title="Refresh rate"
          >
            <RefreshCw size={10} />
            Refresh
          </button>
        </div>
      </div>

      {/* Rate Chart */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', animation: 'scaleIn 0.45s ease-out' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Calendar size={12} />
              USDC / INR · {timeframe === 'LIVE' ? `${data.length} live data point${data.length !== 1 ? 's' : ''}` : timeframe + ' history'}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.03em' }}>
                {rateLoading ? '—' : `₹${currentRate.toFixed(2)}`}
              </h3>
              {!rateLoading && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  fontSize: '0.75rem', fontWeight: '600',
                  color: isUp ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  background: isUp ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                  padding: '0.15rem 0.5rem', borderRadius: '6px'
                }}>
                  {isUp ? <ArrowUpRight size={13} /> : <span style={{ fontSize: '0.7rem', marginRight: '2px' }}>▼</span>}
                  {isUp ? '+' : ''}{priceChg.toFixed(4)} ({pctChg.toFixed(3)}%)
                </span>
              )}
            </div>
          </div>

          {/* Timeframe toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '3px' }}>
            {TIMEFRAMES.map(tf => (
              <button key={tf} onClick={() => { setTimeframe(tf); setHoverIndex(null); }} style={{
                background: timeframe === tf ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none',
                color: timeframe === tf ? 'var(--text-main)' : 'var(--text-secondary)',
                fontWeight: timeframe === tf ? '600' : '400',
                padding: '0.25rem 0.6rem', fontSize: '0.7rem',
                borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-family)',
                transition: 'all 0.2s ease'
              }}>
                {tf === 'LIVE' ? '⚡ LIVE' : tf}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart */}
        <div style={{ position: 'relative', width: '100%' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
            style={{ width: '100%', height: 'auto', overflow: 'visible', cursor: 'crosshair' }}>
            <defs>
              <linearGradient id="liveChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="var(--color-primary)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
              </linearGradient>
              <filter id="liveGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="var(--color-primary)" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = PT + ratio * cH;
              const gv = maxVal - ratio * valRange;
              return (
                <g key={idx}>
                  <line x1={PL} y1={y} x2={W - PR} y2={y}
                    stroke="var(--border-glass)" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={PL - 6} y={y + 4} fill="var(--text-muted)"
                    fontSize="8.5" textAnchor="end" fontFamily="var(--font-family)">
                    ₹{gv.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            {areaD && <path d={areaD} fill="url(#liveChartGrad)" />}

            {/* Stroke line */}
            {pathD && (
              <path d={pathD} fill="none" stroke="var(--color-primary)"
                strokeWidth="2.5" strokeLinecap="round" filter="url(#liveGlow)" />
            )}

            {/* Live pulse dot at last point */}
            {points.length > 0 && timeframe === 'LIVE' && (
              <g>
                <circle cx={points[points.length-1].x} cy={points[points.length-1].y}
                  r="7" fill="var(--accent-emerald)" opacity="0.25">
                  <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={points[points.length-1].x} cy={points[points.length-1].y}
                  r="4" fill="var(--accent-emerald)" stroke="white" strokeWidth="1.5" />
              </g>
            )}

            {/* Hover crosshair */}
            {hoverIndex !== null && points[hoverIndex] && (
              <g>
                <line x1={points[hoverIndex].x} y1={PT}
                  x2={points[hoverIndex].x} y2={PT + cH}
                  stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx={points[hoverIndex].x} cy={points[hoverIndex].y}
                  r="7" fill="var(--color-primary)" opacity="0.3" />
                <circle cx={points[hoverIndex].x} cy={points[hoverIndex].y}
                  r="4.5" fill="var(--text-main)" stroke="var(--color-primary)" strokeWidth="2" />
              </g>
            )}

            {/* X-axis labels */}
            {points.map((p, idx) => {
              const step = Math.max(1, Math.ceil(points.length / 5));
              if (idx % step !== 0 && idx !== points.length - 1) return null;
              return (
                <text key={idx} x={p.x} y={H - 6}
                  fill="var(--text-muted)" fontSize="9" textAnchor="middle"
                  fontFamily="var(--font-family)">
                  {p.label}
                </text>
              );
            })}
          </svg>

          {/* Hover tooltip */}
          {hoverIndex !== null && points[hoverIndex] && (
            <div style={{
              position: 'absolute',
              left: `${(points[hoverIndex].x / W) * 100}%`,
              top: `${(points[hoverIndex].y / H) * 100 - 32}%`,
              transform: 'translate(-50%, -100%)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass-hover)',
              borderRadius: '8px', padding: '0.35rem 0.55rem',
              fontSize: '0.72rem', boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
              pointerEvents: 'none', zIndex: 5, whiteSpace: 'nowrap',
              display: 'flex', flexDirection: 'column', gap: '0.08rem',
              backdropFilter: 'blur(12px)'
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                {points[hoverIndex].label}
              </span>
              <strong style={{ color: 'var(--accent-indigo)', fontSize: '0.85rem' }}>
                ₹{points[hoverIndex].value.toFixed(4)}
              </strong>
              {usdcInput && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                  {usdcInput} USDC = ₹{(parseFloat(usdcInput) * points[hoverIndex].value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem', background: 'rgba(0,0,0,0.08)',
          padding: '0.7rem', borderRadius: 'var(--border-radius-sm)',
          border: '1px solid var(--border-glass)', fontSize: '0.75rem', textAlign: 'center'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Period Low</span>
            <p style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '0.15rem' }}>
              ₹{Math.min(...values).toFixed(4)}
            </p>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-glass)', borderRight: '1px solid var(--border-glass)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Average</span>
            <p style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '0.15rem' }}>
              ₹{avgRate.toFixed(4)}
            </p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Period High</span>
            <p style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '0.15rem' }}>
              ₹{Math.max(...values).toFixed(4)}
            </p>
          </div>
        </div>

        {/* Source note */}
        <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', paddingTop: '0.25rem' }}>
          {rateError
            ? `Using estimated rate · API: ${rateError}`
            : 'Powered by CoinGecko API · Refreshes every 60 seconds'}
        </div>
      </div>
    </div>
  );
}
