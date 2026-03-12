import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerState, TimerSettings, SessionType } from '../types/timer';

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

function sessionDuration(sessionType: SessionType, settings: TimerSettings): number {
  switch (sessionType) {
    case 'work': return settings.workDuration * 60;
    case 'short-break': return settings.shortBreakDuration * 60;
    case 'long-break': return settings.longBreakDuration * 60;
  }
}

export function useTimer() {
  const [state, setState] = useState<TimerState>({
    status: 'idle',
    sessionType: 'work',
    timeRemaining: DEFAULT_SETTINGS.workDuration * 60,
    completedSessions: 0,
    settings: DEFAULT_SETTINGS,
    sessionJustCompleted: null,
  });

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
        const completedSession = prev.sessionType;
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
          sessionJustCompleted: completedSession,
        };
      }
      return { ...prev, timeRemaining: prev.timeRemaining - 1 };
    });
  }, []);

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
      prev.status !== 'running'
        ? { ...prev, status: 'running', sessionJustCompleted: null }
        : prev
    );
  }, []);

  const pause = useCallback(() => {
    setState(prev =>
      prev.status === 'running'
        ? { ...prev, status: 'paused', sessionJustCompleted: null }
        : prev
    );
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'idle',
      timeRemaining: sessionDuration(prev.sessionType, prev.settings),
      sessionJustCompleted: null,
    }));
  }, []);

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
        sessionJustCompleted: null,
      };
    });
  }, []);

  const dismissAlert = useCallback(() => {
    setState(prev => ({ ...prev, sessionJustCompleted: null }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setState(prev => {
      const settings = { ...prev.settings, ...newSettings };
      const timeRemaining =
        prev.status === 'idle'
          ? sessionDuration(prev.sessionType, settings)
          : prev.timeRemaining;
      return { ...prev, settings, timeRemaining };
    });
  }, []);

  return { state, start, pause, reset, skipSession, updateSettings, dismissAlert };
}
