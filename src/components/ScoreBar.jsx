export default function ScoreBar({ name, gender, score, onBack }) {
  const avatar = gender === 'girl' ? '👧' : '👦'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      background: 'rgba(255,255,255,0.7)',
      borderBottom: '2px solid #e0ecf0',
    }}>
      <button
        onClick={onBack}
        style={{
          padding: '6px 10px',
          fontSize: '1.2rem',
          background: '#fff0f0',
          borderRadius: 10,
          border: '2px solid #ff6b6b',
          color: '#ff6b6b',
          lineHeight: 1,
        }}
      >
        ←
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1.3rem' }}>{avatar}</span>
        <span style={{
          fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 600,
          color: '#2c3e50',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 150,
        }}>
          {name}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1.5rem' }}>⭐</span>
        <span style={{
          fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 600,
          color: '#ff8c00',
        }}>
          {score}
        </span>
      </div>
    </div>
  )
}
