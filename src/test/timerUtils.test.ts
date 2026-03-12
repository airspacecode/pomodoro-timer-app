import { describe, it, expect } from 'vitest';
import { formatTime, getDurationForSession, getNextSessionType } from '../utils/timerUtils';
import type { TimerSettings } from '../types/timer';

const settings: TimerSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
};

describe('formatTime', () => {
  it('formats zero as 00:00', () => expect(formatTime(0)).toBe('00:00'));
  it('formats 90 seconds as 01:30', () => expect(formatTime(90)).toBe('01:30'));
  it('formats 25 minutes as 25:00', () => expect(formatTime(1500)).toBe('25:00'));
});

describe('getDurationForSession', () => {
  it('returns workDuration for work', () => expect(getDurationForSession('work', settings)).toBe(1500));
  it('returns shortBreakDuration for shortBreak', () => expect(getDurationForSession('shortBreak', settings)).toBe(300));
  it('returns longBreakDuration for longBreak', () => expect(getDurationForSession('longBreak', settings)).toBe(900));
});

describe('getNextSessionType', () => {
  it('transitions work → shortBreak when not at long break threshold', () => {
    expect(getNextSessionType('work', 1, 4)).toBe('shortBreak');
    expect(getNextSessionType('work', 2, 4)).toBe('shortBreak');
    expect(getNextSessionType('work', 3, 4)).toBe('shortBreak');
  });

  it('transitions work → longBreak every sessionsBeforeLongBreak sessions', () => {
    expect(getNextSessionType('work', 4, 4)).toBe('longBreak');
    expect(getNextSessionType('work', 8, 4)).toBe('longBreak');
  });

  it('transitions shortBreak → work', () => {
    expect(getNextSessionType('shortBreak', 1, 4)).toBe('work');
  });

  it('transitions longBreak → work', () => {
    expect(getNextSessionType('longBreak', 4, 4)).toBe('work');
  });
});
