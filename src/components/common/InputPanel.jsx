/**
 * InputPanel.jsx
 *
 * Shared controller component for user data inputs and preset select buttons.
 */

/**
 * @param {{
 *   value: string,
 *   onChange: (val: string) => void,
 *   onSubmit: () => void,
 *   placeholder?: string,
 *   label?: string,
 *   presets?: Array<{ label: string, value: string }>,
 *   buttonText?: string,
 *   disabled?: boolean
 * }} props
 */
export default function InputPanel({
  value,
  onChange,
  onSubmit,
  placeholder = 'e.g. 50, 30, 70, 20, 40',
  label = 'Values',
  presets = [],
  buttonText = 'Run',
  disabled = false,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="input-panel">
      <div>
        {label && <div className="input-label">{label}</div>}
        <textarea
          className="input-field"
          style={{ minHeight: 60 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          spellCheck={false}
        />
      </div>

      {presets && presets.length > 0 && (
        <div className="preset-row">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="preset-btn"
              onClick={() => onChange(preset.value)}
              disabled={disabled}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        style={{ alignSelf: 'flex-start' }}
      >
        ▶ {buttonText}
      </button>
    </div>
  )
}
