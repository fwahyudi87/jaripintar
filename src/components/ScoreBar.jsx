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
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
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
        <button
          onClick={onBack}
          style={{
            padding: '4px 12px',
            fontSize: '0.8rem',
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 600,
            color: '#5a7a8a',
            background: 'rgba(255,255,255,0.5)',
            borderRadius: 8,
            border: '2px solid #c0d8e0',
            marginLeft: 4,
          }}
        >
          ←
        </button>
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
