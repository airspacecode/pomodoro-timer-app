import type { SessionType, TimerSettings } from '../types/timer';

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getDurationForSession(type: SessionType, settings: TimerSettings): number {
  switch (type) {
    case 'work':
      return settings.workDuration;
    case 'short-break':
      return settings.shortBreakDuration;
    case 'long-break':
      return settings.longBreakDuration;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function getNextSessionType(
  completedSessions: number,
  longBreakInterval: number
): SessionType {
  return completedSessions % longBreakInterval === 0
    ? 'long-break'
    : 'short-break';
}

export function getSessionLabel(type: SessionType): string {
  switch (type) {
    case 'work':
      return 'Work';
    case 'short-break':
      return 'Short Break';
    case 'long-break':
      return 'Long Break';
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}