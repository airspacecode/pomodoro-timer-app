import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../hooks/useTimer';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const quickSettings = {
  workDuration: 3,
  shortBreakDuration: 2,
  longBreakDuration: 4,
  sessionsBeforeLongBreak: 2,
};

describe('useTimer', () => {
  it('starts in idle state with correct initial time', () => {
    const { result } = renderHook(() => useTimer(quickSettings));
    expect(result.current.status).toBe('idle');
    expect(result.current.sessionType).toBe('work');
    expect(result.current.timeRemaining).toBe(3);
    expect(result.current.completedWorkSessions).toBe(0);
  });

  it('transitions to running on start', () => {
    const { result } = renderHook(() => useTimer(quickSettings));
    act(() => result.current.start());
    expect(result.current.status).toBe('running');
  });

  it('pauses correctly', () => {
    const { result } = renderHook(() => useTimer(quickSettings));
    act(() => result.current.start());
    act(() => result.current.pause());
    expect(result.current.status).toBe('paused');
  });

  it('counts down correctly', () => {
    const { result } = renderHook(() => useTimer(quickSettings));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.timeRemaining).toBe(2);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.timeRemaining).toBe(1);
  });

  it('resets to initial time of current session', () => {
    const { result } = renderHook(() => useTimer(quickSettings));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1000));
    act(() => result.current.reset());
    expect(result.current.status).toBe('idle');
    expect(result.current.timeRemaining).toBe(3);
  });

  it('auto-transitions to shortBreak after first work session', () => {
    const { result } = renderHook(() => useTimer(quickSettings));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000)); // 3 seconds = full work session
    expect(result.current.sessionType).toBe('shortBreak');
    expect(result.current.completedWorkSessions).toBe(1);
    expect(result.current.status).toBe('idle');
  });

  it('auto-transitions to longBreak after sessionsBeforeLongBreak work sessions', () => {
    const { result } = renderHook(() => useTimer(quickSettings));
    // Session 1: work → shortBreak
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000));
    // Session 2: shortBreak → work
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(2000));
    // Session 2: work → longBreak (2 completed work sessions = sessionsBeforeLongBreak)
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.sessionType).toBe('longBreak');
    expect(result.current.completedWorkSessions).toBe(2);
  });

  it('skip advances to next session without running', () => {
    const { result } = renderHook(() => useTimer(quickSettings));
    act(() => result.current.skipSession());
    expect(result.current.sessionType).toBe('shortBreak');
    expect(result.current.status).toBe('idle');
  });

  it('does not tick when paused', () => {
    const { result } = renderHook(() => useTimer(quickSettings));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1000));
    act(() => result.current.pause());
    const timeBefore = result.current.timeRemaining;
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.timeRemaining).toBe(timeBefore);
  });
});
