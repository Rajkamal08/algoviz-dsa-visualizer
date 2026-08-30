/**
 * PlaybackControls.jsx
 *
 * Universal playback controller interface.
 * Connects directly to the usePlayback hook returned object.
 */

import { SPEED_OPTIONS } from '../../core/playback/usePlayback.js'

/**
 * @param {{
 *   playback: {
 *     frameIndex: number,
 *     totalFrames: number,
 *     isPlaying: boolean,
 *     speed: number,
 *     isDone: boolean,
 *     controls: {
 *       play: () => void,
 *       pause: () => void,
 *       toggle: () => void,
 *       stepForward: () => void,
 *       stepBack: () => void,
 *       goToStart: () => void,
 *       goToEnd: () => void,
 *       seek: (index: number) => void,
 *       setSpeed: (speed: number) => void
 *     }
 *   }
 * }} props
 */
export default function PlaybackControls({ playback }) {
  if (!playback || playback.totalFrames === 0) {
    return null
  }

  const { frameIndex, totalFrames, isPlaying, speed, controls } = playback
  const progressPercent = totalFrames > 1 ? (frameIndex / (totalFrames - 1)) * 100 : 0

  const handleProgressBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    const index = Math.round(percentage * (totalFrames - 1))
    controls.seek(index)
  }

  return (
    <div className="playback-bar" role="region" aria-label="Animation Playback Controls">
      {/* Go to Start */}
      <button
        className="playback-btn"
        onClick={controls.goToStart}
        title="Go to Start (Home)"
        aria-label="Go to Start"
      >
        ⏮
      </button>

      {/* Step Back */}
      <button
        className="playback-btn"
        onClick={controls.stepBack}
        disabled={frameIndex === 0}
        title="Step Backward (Left Arrow)"
        aria-label="Step Backward"
      >
        ⏪
      </button>

      {/* Play / Pause */}
      <button
        className={`playback-btn primary`}
        onClick={controls.toggle}
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Step Forward */}
      <button
        className="playback-btn"
        onClick={controls.stepForward}
        disabled={frameIndex === totalFrames - 1}
        title="Step Forward (Right Arrow)"
        aria-label="Step Forward"
      >
        ⏩
      </button>

      {/* Go to End */}
      <button
        className="playback-btn"
        onClick={controls.goToEnd}
        title="Go to End (End)"
        aria-label="Go to End"
      >
        ⏭
      </button>

      {/* Timeline Progress Slider */}
      <div className="playback-progress">
        <div
          className="playback-track"
          onClick={handleProgressBarClick}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={totalFrames - 1}
          aria-valuenow={frameIndex}
          aria-valuetext={`Step ${frameIndex + 1} of ${totalFrames}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') controls.stepForward()
            if (e.key === 'ArrowLeft') controls.stepBack()
            if (e.key === 'Home') controls.goToStart()
            if (e.key === 'End') controls.goToEnd()
          }}
        >
          <div className="playback-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="playback-counters">
          <span>Step {frameIndex + 1} of {totalFrames}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* Speed Controls */}
      <div className="playback-speed">
        {SPEED_OPTIONS.map((opt) => (
          <button
            key={opt}
            className={`speed-btn ${speed === opt ? 'active' : ''}`}
            onClick={() => controls.setSpeed(opt)}
            aria-label={`Set speed to ${opt}x`}
          >
            {opt}x
          </button>
        ))}
      </div>
    </div>
  )
}
