import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../hooks/useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with idle work session', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.sessionType).toBe('work');
    expect(result.current.state.sessionJustCompleted).toBeNull();
  });

  it('transitions to running on start', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.start(); });
    expect(result.current.state.status).toBe('running');
  });

  it('transitions to paused on pause', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.start(); });
    act(() => { result.current.pause(); });
    expect(result.current.state.status).toBe('paused');
  });

  it('sets sessionJustCompleted when session ends', () => {
    const { result } = renderHook(() => useTimer());
    // Use a very short duration for the test
    act(() => { result.current.updateSettings({ workDuration: 1 }); });
    act(() => { result.current.start(); });

    // Advance timer by 1 second to complete the 1-minute session... actually 60 seconds
    act(() => { vi.advanceTimersByTime(60 * 1000); });

    expect(result.current.state.sessionJustCompleted).toBe('work');
    expect(result.current.state.status).toBe('idle');
  });

  it('clears sessionJustCompleted when start is called', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.updateSettings({ workDuration: 1 }); });
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(60 * 1000); });
    expect(result.current.state.sessionJustCompleted).toBe('work');

    act(() => { result.current.start(); });
    expect(result.current.state.sessionJustCompleted).toBeNull();
  });

  it('clears sessionJustCompleted on dismissAlert', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.updateSettings({ workDuration: 1 }); });
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(60 * 1000); });
    expect(result.current.state.sessionJustCompleted).toBe('work');

    act(() => { result.current.dismissAlert(); });
    expect(result.current.state.sessionJustCompleted).toBeNull();
  });

  it('advances to short-break after first work session', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.updateSettings({ workDuration: 1 }); });
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(60 * 1000); });

    expect(result.current.state.sessionType).toBe('short-break');
    expect(result.current.state.completedSessions).toBe(1);
  });

  it('advances to long-break after 4 work sessions', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.updateSettings({ workDuration: 1, shortBreakDuration: 1 }); });

    for (let i = 0; i < 4; i++) {
      act(() => { result.current.start(); });
      act(() => { vi.advanceTimersByTime(60 * 1000); });
      if (i < 3) {
        // start and complete the break
        act(() => { result.current.start(); });
        act(() => { vi.advanceTimersByTime(60 * 1000); });
      }
    }

    expect(result.current.state.sessionType).toBe('long-break');
  });

  it('skip does not set sessionJustCompleted', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.skipSession(); });
    expect(result.current.state.sessionJustCompleted).toBeNull();
  });

  it('reset does not set sessionJustCompleted', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.start(); });
    act(() => { result.current.reset(); });
    expect(result.current.state.sessionJustCompleted).toBeNull();
  });
});
