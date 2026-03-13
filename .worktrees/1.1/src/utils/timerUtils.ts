import type { SessionType, TimerSettings } from '../types/timer';

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function getDurationForSession(type: SessionType, settings: TimerSettings): number {
  switch (type) {
    case 'work':
      return settings.workDuration;
    case 'shortBreak':
      return settings.shortBreakDuration;
    case 'longBreak':
      return settings.longBreakDuration;
  }
}

export function getNextSessionType(
  currentType: SessionType,
  completedWorkSessions: number,
  sessionsBeforeLongBreak: number
): SessionType {
  if (currentType === 'work') {
    return completedWorkSessions % sessionsBeforeLongBreak === 0
      ? 'longBreak'
      : 'shortBreak';
  }
  return 'work';
}

export function getSessionLabel(type: SessionType): string {
  switch (type) {
    case 'work':
      return 'Focus';
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
  }
}
