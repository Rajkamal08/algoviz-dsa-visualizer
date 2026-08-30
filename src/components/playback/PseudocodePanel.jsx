/**
 * PseudocodePanel.jsx
 *
 * Displays algorithm code/pseudocode with current line highlighted.
 * Automatically scrolls the active line into view.
 */

import { useEffect, useRef, useState } from 'react'

/**
 * @param {{
 *   pseudocode: string[] | { [lang: string]: string[] },
 *   codeLineIndex: number
 * }} props
 */
export default function PseudocodePanel({ pseudocode, codeLineIndex = -1 }) {
  const [activeLang, setActiveLang] = useState('')
  const containerRef = useRef(null)
  const lineRefs = useRef([])

  // Determine languages available
  const hasMultipleLangs = pseudocode && !Array.isArray(pseudocode)
  const languages = hasMultipleLangs ? Object.keys(pseudocode) : []

  // Default to first language if object
  useEffect(() => {
    if (hasMultipleLangs && languages.length > 0 && !activeLang) {
      setActiveLang(languages[0])
    }
  }, [pseudocode, hasMultipleLangs, languages, activeLang])

  // Get current active lines array
  const lines = hasMultipleLangs
    ? pseudocode[activeLang] || []
    : Array.isArray(pseudocode)
    ? pseudocode
    : []

  // Ensure lineRefs array matches current lines count
  useEffect(() => {
    lineRefs.current = lineRefs.current.slice(0, lines.length)
  }, [lines])

  // Scroll active line into view
  useEffect(() => {
    if (codeLineIndex >= 0 && codeLineIndex < lines.length) {
      const activeElement = lineRefs.current[codeLineIndex]
      const container = containerRef.current
      if (activeElement && container) {
        const activeRect = activeElement.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        // Only scroll if it's out of bounds
        if (
          activeRect.top < containerRect.top ||
          activeRect.bottom > containerRect.bottom
        ) {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          })
        }
      }
    }
  }, [codeLineIndex, lines.length])

  if (!lines || lines.length === 0) {
    return (
      <div className="panel pseudocode-panel">
        <div className="panel-header">
          <span className="panel-title">Pseudocode</span>
        </div>
        <div className="panel-body">
          <div className="empty-copy">No pseudocode available for this step.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="panel pseudocode-panel">
      <div className="panel-header">
        <span className="panel-title">Pseudocode</span>
      </div>

      {hasMultipleLangs && (
        <div className="pseudocode-lang-select" role="tablist" aria-label="Programming Language Selector">
          {languages.map((lang) => (
            <button
              key={lang}
              role="tab"
              aria-selected={activeLang === lang}
              className={`pseudocode-lang-btn ${activeLang === lang ? 'active' : ''}`}
              onClick={() => setActiveLang(lang)}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="panel-body" style={{ padding: 0 }}>
        <div className="pseudocode-lines" ref={containerRef} tabIndex={0}>
          {lines.map((line, idx) => {
            const isHighlighted = idx === codeLineIndex
            return (
              <div
                key={idx}
                ref={(el) => (lineRefs.current[idx] = el)}
                className={`pseudocode-line ${isHighlighted ? 'highlighted' : ''}`}
                aria-current={isHighlighted ? 'step' : undefined}
              >
                <span className="pseudocode-lineno">{idx + 1}</span>
                <span
                  className="pseudocode-code"
                  style={{
                    paddingLeft: `${(line.search(/\S/) || 0) * 8}px`,
                  }}
                >
                  {line.trim()}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
