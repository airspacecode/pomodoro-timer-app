import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { TimerActions, TimerSettings, TimerState } from '../types/timer';
import { getDurationForSession, getNextSessionType } from '../utils/timerUtils';

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
};

type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'SKIP' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TimerSettings> };

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      if (state.status === 'running') return state;
      return { ...state, status: 'running' };

    case 'PAUSE':
      if (state.status !== 'running') return state;
      return { ...state, status: 'paused' };

    case 'RESET':
      return {
        ...state,
        status: 'idle',
        timeRemaining: getDurationForSession(state.sessionType, state.settings),
      };

    case 'TICK': {
      if (state.status !== 'running') return state;
      if (state.timeRemaining > 1) {
        return { ...state, timeRemaining: state.timeRemaining - 1 };
      }
      // timeRemaining is 1 or 0 — session complete, transition automatically
      const newCompletedWork =
        state.sessionType === 'work'
          ? state.completedWorkSessions + 1
          : state.completedWorkSessions;
      const nextSession = getNextSessionType(
        state.sessionType,
        newCompletedWork,
        state.settings.sessionsBeforeLongBreak
      );
      return {
        ...state,
        status: 'idle',
        sessionType: nextSession,
        timeRemaining: getDurationForSession(nextSession, state.settings),
        completedWorkSessions: newCompletedWork,
      };
    }

    case 'SKIP': {
      const newCompletedWork =
        state.sessionType === 'work'
          ? state.completedWorkSessions + 1
          : state.completedWorkSessions;
      const nextSession = getNextSessionType(
        state.sessionType,
        newCompletedWork,
        state.settings.sessionsBeforeLongBreak
      );
      return {
        ...state,
        status: 'idle',
        sessionType: nextSession,
        timeRemaining: getDurationForSession(nextSession, state.settings),
        completedWorkSessions: newCompletedWork,
      };
    }

    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...action.payload };
      // If the timer is idle, also update the current session duration
      const timeRemaining =
        state.status === 'idle'
          ? getDurationForSession(state.sessionType, newSettings)
          : state.timeRemaining;
      return { ...state, settings: newSettings, timeRemaining };
    }

    default:
      return state;
  }
}

function buildInitialState(settings: TimerSettings = DEFAULT_SETTINGS): TimerState {
  return {
    status: 'idle',
    sessionType: 'work',
    timeRemaining: settings.workDuration,
    completedWorkSessions: 0,
    settings,
  };
}

export function useTimer(initialSettings?: Partial<TimerSettings>): TimerState & TimerActions {
  const mergedSettings = { ...DEFAULT_SETTINGS, ...initialSettings };
  const [state, dispatch] = useReducer(timerReducer, mergedSettings, buildInitialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.status === 'running') {
      intervalRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.status]);

  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const skipSession = useCallback(() => dispatch({ type: 'SKIP' }), []);
  const updateSettings = useCallback(
    (settings: Partial<TimerSettings>) =>
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    []
  );

  return { ...state, start, pause, reset, skipSession, updateSettings };
}
