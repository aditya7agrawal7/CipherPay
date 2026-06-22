const networks = [
  {
    id: 'stellar',
    name: 'Stellar',
    color: '#14B6E7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <path d="M12 2L6 12l6 10 6-10L12 2z" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'solana',
    name: 'Solana',
    color: '#9945FF',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <path d="M5 8h14v2H5V8zm0 3h14v2H5v-2zm0 3h10v2H5v-2z" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'celo',
    name: 'Celo',
    color: '#35C759',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.2" />
        <path d="M12 6a6 6 0 100 12 6 6 0 000-12zm-1 9.5v-1h2v1h-2zm0-2.5v-1h2v1h-2zm0-2.5v-1h2v1h-2z" fill="currentColor" />
      </svg>
    )
  }
];

export default function NetworkBadges() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      marginBottom: '1.5rem'
    }}>
      <span style={{
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        Powered by
      </span>
      {networks.map((network) => (
        <div
          key={network.id}
          className="network-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.7rem',
            background: `${network.color}10`,
            border: `1px solid ${network.color}25`,
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: '600',
            color: network.color,
            transition: 'all 0.2s ease',
            cursor: 'default'
          }}
        >
          {network.icon}
          {network.name}
        </div>
      ))}
    </div>
  );
}
