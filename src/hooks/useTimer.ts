import { useEffect, useCallback, useRef } from 'react';
import type { TimerState, TimerSettings, SessionType } from '../types/timer';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

const STORAGE_KEY = 'pomodoro-state';

function sessionDuration(sessionType: SessionType, settings: TimerSettings): number {
  switch (sessionType) {
    case 'work': return settings.workDuration * 60;
    case 'short-break': return settings.shortBreakDuration * 60;
    case 'long-break': return settings.longBreakDuration * 60;
  }
}

const DEFAULT_STATE: TimerState = {
  status: 'idle',
  sessionType: 'work',
  timeRemaining: DEFAULT_SETTINGS.workDuration * 60,
  completedSessions: 0,
  settings: DEFAULT_SETTINGS,
};

function sanitizeRestoredState(raw: TimerState): TimerState {
  // If the timer was running when the page closed, restore it as paused
  // so the user can see where they left off and resume intentionally.
  return raw.status === 'running'
    ? { ...raw, status: 'paused' }
    : raw;
}

function isValidTimerState(value: unknown): value is TimerState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.timeRemaining === 'number' &&
    typeof v.completedSessions === 'number' &&
    (v.status === 'idle' || v.status === 'running' || v.status === 'paused') &&
    (v.sessionType === 'work' || v.sessionType === 'short-break' || v.sessionType === 'long-break') &&
    v.settings !== null &&
    typeof v.settings === 'object'
  );
}

function loadInitialState(): TimerState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as unknown;
      if (isValidTimerState(parsed)) {
        return sanitizeRestoredState(parsed);
      }
    }
  } catch {
    // corrupt storage — fall through to default
  }
  return DEFAULT_STATE;
}

export function useTimer() {
  const [state, setState] = useLocalStorage<TimerState>(STORAGE_KEY, loadInitialState());

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setState(prev => {
      if (prev.timeRemaining <= 1) {
        // Session complete — advance to next session
        const completedSessions =
          prev.sessionType === 'work' ? prev.completedSessions + 1 : prev.completedSessions;

        let nextSession: SessionType;
        if (prev.sessionType === 'work') {
          nextSession =
            completedSessions % prev.settings.longBreakInterval === 0
              ? 'long-break'
              : 'short-break';
        } else {
          nextSession = 'work';
        }

        return {
          ...prev,
          status: 'idle',
          sessionType: nextSession,
          timeRemaining: sessionDuration(nextSession, prev.settings),
          completedSessions,
        };
      }
      return { ...prev, timeRemaining: prev.timeRemaining - 1 };
    });
  }, [setState]);

  useEffect(() => {
    setState(prev => {
      if (prev.status === 'running') {
        clearTimer();
        intervalRef.current = setInterval(tick, 1000);
      } else {
        clearTimer();
      }
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  // Re-attach interval on tick reference change
  useEffect(() => {
    if (state.status === 'running') {
      clearTimer();
      intervalRef.current = setInterval(tick, 1000);
    }
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const start = useCallback(() => {
    setState(prev =>
      prev.status !== 'running' ? { ...prev, status: 'running' } : prev
    );
  }, [setState]);

  const pause = useCallback(() => {
    setState(prev =>
      prev.status === 'running' ? { ...prev, status: 'paused' } : prev
    );
  }, [setState]);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'idle',
      timeRemaining: sessionDuration(prev.sessionType, prev.settings),
    }));
  }, [setState]);

  const skipSession = useCallback(() => {
    setState(prev => {
      const completedSessions =
        prev.sessionType === 'work' ? prev.completedSessions + 1 : prev.completedSessions;
      let nextSession: SessionType;
      if (prev.sessionType === 'work') {
        nextSession =
          completedSessions % prev.settings.longBreakInterval === 0
            ? 'long-break'
            : 'short-break';
      } else {
        nextSession = 'work';
      }
      return {
        ...prev,
        status: 'idle',
        sessionType: nextSession,
        timeRemaining: sessionDuration(nextSession, prev.settings),
        completedSessions,
      };
    });
  }, [setState]);

  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setState(prev => {
      const settings = { ...prev.settings, ...newSettings };
      // If timer is idle, update the time remaining for the current session
      const timeRemaining =
        prev.status === 'idle'
          ? sessionDuration(prev.sessionType, settings)
          : prev.timeRemaining;
      return { ...prev, settings, timeRemaining };
    });
  }, [setState]);

  return { state, start, pause, reset, skipSession, updateSettings };
}
