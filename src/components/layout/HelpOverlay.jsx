/**
 * HelpOverlay.jsx
 *
 * Modal overlay listing keyboard shortcuts and app info.
 * Triggered by pressing "?" from any page.
 */

export default function HelpOverlay({ onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 16, padding: '32px 40px',
        minWidth: 380, maxWidth: 480,
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 4 }}>
              KEYBOARD SHORTCUTS
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
              AlgoViz Help
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close help"
            style={{
              background: 'var(--bg-tertiary)', border: 'none', borderRadius: 8,
              width: 32, height: 32, cursor: 'pointer', fontSize: 16,
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { keys: ['?'],           label: 'Show / hide this help overlay' },
            { keys: ['Esc'],         label: 'Go to dashboard' },
            { keys: ['Space'],       label: 'Play / pause animation (on visualizer)' },
            { keys: ['→'],           label: 'Step forward one frame' },
            { keys: ['←'],           label: 'Step backward one frame' },
            { keys: ['Shift', '→'],  label: 'Jump to end' },
            { keys: ['Shift', '←'],  label: 'Jump to start' },
          ].map(({ keys, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {keys.map((k) => (
                  <kbd key={k} style={{
                    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                  }}>{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 12, color: 'var(--text-muted)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>AlgoViz — Universal DSA Visualizer</span>
          <button
            onClick={onClose}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
            }}
          >Close</button>
        </div>
      </div>
    </div>
  )
}
