/**
 * usePlayback.js
 *
 * Universal React hook for controlling algorithm animation playback.
 *
 * Works with ANY algorithm's frames[] array — sorting, BST, Dijkstra, DP, etc.
 * The hook owns all playback state. Components just call the controls.
 *
 * USAGE:
 *   const frames = bst.insert(50)  // returns Frame[]
 *   const { currentFrame, frameIndex, totalFrames, isPlaying, speed, controls } = usePlayback(frames)
 *
 *   controls.play()
 *   controls.pause()
 *   controls.stepForward()
 *   controls.stepBack()
 *   controls.goToStart()
 *   controls.goToEnd()
 *   controls.seek(12)          // jump to frame 12
 *   controls.setSpeed(2)       // 2× speed
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// Delay in ms between frames at speed=1. Multiply to get actual delay.
const BASE_DELAY_MS = 700

// Supported speed multipliers (shown in UI)
export const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2, 3]

/**
 * @param {import('../frames/FrameRecorder').Frame[]} frames
 * @returns {{
 *   currentFrame: Object|null,
 *   frameIndex: number,
 *   totalFrames: number,
 *   isPlaying: boolean,
 *   speed: number,
 *   isDone: boolean,
 *   controls: Object
 * }}
 */
export default function usePlayback(frames) {
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying,  setIsPlaying]  = useState(false)
  const [speed,      setSpeedState] = useState(1)

  const intervalRef = useRef(null)
  const framesRef   = useRef(frames)

  // Keep ref in sync so the interval always reads the latest frames array
  useEffect(() => {
    framesRef.current = frames
  }, [frames])

  // When a new frames array is loaded (new algorithm run), reset to frame 0
  useEffect(() => {
    setFrameIndex(0)
    setIsPlaying(false)
  }, [frames])

  // Auto-play interval
  useEffect(() => {
    clearInterval(intervalRef.current)

    if (!isPlaying || framesRef.current.length === 0) return

    const delay = BASE_DELAY_MS / speed

    intervalRef.current = setInterval(() => {
      setFrameIndex((prev) => {
        const next = prev + 1
        if (next >= framesRef.current.length) {
          // Reached the end — stop playing
          setIsPlaying(false)
          clearInterval(intervalRef.current)
          return prev
        }
        return next
      })
    }, delay)

    return () => clearInterval(intervalRef.current)
  }, [isPlaying, speed])

  // ─── Global Arrow-Key + Space Shortcuts ───────────────────────────────────
  // Space = toggle, → = step forward, ← = step back,
  // Shift+→ = go to end, Shift+← = go to start
  useEffect(() => {
    const onKey = (e) => {
      // Don't intercept when focus is in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (framesRef.current.length === 0) return

      if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying((prev) => !prev)
      } else if (e.key === 'ArrowRight' && e.shiftKey) {
        e.preventDefault()
        setIsPlaying(false)
        setFrameIndex(Math.max(0, framesRef.current.length - 1))
      } else if (e.key === 'ArrowLeft' && e.shiftKey) {
        e.preventDefault()
        setIsPlaying(false)
        setFrameIndex(0)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIsPlaying(false)
        setFrameIndex((prev) => Math.min(prev + 1, framesRef.current.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIsPlaying(false)
        setFrameIndex((prev) => Math.max(prev - 1, 0))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ─── Controls ─────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    // If already at end, restart from beginning
    setFrameIndex((prev) => {
      if (prev >= framesRef.current.length - 1) return 0
      return prev
    })
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    setFrameIndex((prev) => Math.min(prev + 1, framesRef.current.length - 1))
  }, [])

  const stepBack = useCallback(() => {
    setIsPlaying(false)
    setFrameIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const goToStart = useCallback(() => {
    setIsPlaying(false)
    setFrameIndex(0)
  }, [])

  const goToEnd = useCallback(() => {
    setIsPlaying(false)
    setFrameIndex(Math.max(0, framesRef.current.length - 1))
  }, [])

  const seek = useCallback((index) => {
    setIsPlaying(false)
    setFrameIndex(Math.max(0, Math.min(index, framesRef.current.length - 1)))
  }, [])

  const setSpeed = useCallback((newSpeed) => {
    setSpeedState(newSpeed)
  }, [])

  const toggle = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  // ─── Derived values ────────────────────────────────────────────────────────

  const totalFrames  = frames.length
  const currentFrame = frames[frameIndex] ?? null
  const isDone       = totalFrames > 0 && frameIndex === totalFrames - 1

  return {
    currentFrame,
    frameIndex,
    totalFrames,
    isPlaying,
    speed,
    isDone,
    controls: {
      play,
      pause,
      toggle,
      stepForward,
      stepBack,
      goToStart,
      goToEnd,
      seek,
      setSpeed,
    },
  }
}
