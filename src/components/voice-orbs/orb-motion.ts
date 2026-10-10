import type { OrbMotionSettings, OrbState } from "./orb-state";

export const DEFAULT_PARTICLE_COUNT = 720;

export const ORB_MOTION_PRESETS: Record<OrbState, OrbMotionSettings> = {
  idle: {
    tempo: 1, scale: 1, spin: 0.14, breathe: 0.05, breatheRate: 1, drift: 1,
    ripple: 0, swell: 0.04, flow: 0, swirl: 0, pulse: 0, pulseRate: 1,
    ring: 0, ringWidth: 0.13, jitter: 0, shake: 0, alpha: 0.72, rest: 0,
  },
  connecting: {
    tempo: 1, scale: 1, spin: 0.3, breathe: 0.02, breatheRate: 1, drift: 0.2,
    ripple: 0, swell: 0, flow: 0, swirl: 0, pulse: 0.06, pulseRate: 0.5,
    ring: 1, ringWidth: 0.13, jitter: 0, shake: 0, alpha: 0.8, rest: 0.12,
  },
  listening: {
    tempo: 1, scale: 0.9, spin: 0.55, breathe: 0.012, breatheRate: 1, drift: 0,
    ripple: 1, swell: 0.06, flow: 0, swirl: 0, pulse: 0, pulseRate: 1,
    ring: 0, ringWidth: 0.13, jitter: 0, shake: 0, alpha: 0.92, rest: 0.55,
  },
  thinking: {
    tempo: 1, scale: 1, spin: 0.32, breathe: 0.01, breatheRate: 1, drift: 0,
    ripple: 0, swell: 0, flow: 0, swirl: 0, pulse: 1, pulseRate: 1,
    ring: 0, ringWidth: 0.13, jitter: 0, shake: 0, alpha: 0.78, rest: 0.3,
  },
  speaking: {
    tempo: 1, scale: 1, spin: 0.24, breathe: 0.01, breatheRate: 1, drift: 0,
    ripple: 0, swell: 0.06, flow: 1, swirl: 1, pulse: 0, pulseRate: 1,
    ring: 0, ringWidth: 0.13, jitter: 0.6, shake: 0, alpha: 0.94, rest: 0.55,
  },
  error: {
    tempo: 1, scale: 1, spin: 0.08, breathe: 0, breatheRate: 1, drift: 0,
    ripple: 0, swell: 0, flow: 0, swirl: 0, pulse: 0, pulseRate: 1,
    ring: 0, ringWidth: 0.13, jitter: 0.7, shake: 1, alpha: 0.85, rest: 0.2,
  },
  disabled: {
    tempo: 0.04, scale: 1, spin: 0, breathe: 0, breatheRate: 1, drift: 0,
    ripple: 0, swell: 0, flow: 0, swirl: 0, pulse: 0, pulseRate: 1,
    ring: 0, ringWidth: 0.13, jitter: 0, shake: 0, alpha: 0.45, rest: 0,
  },
};
