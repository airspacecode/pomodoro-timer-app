export type SessionType = 'work' | 'short-break' | 'long-break';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerSettings {
  workDuration: number;      // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // number of work sessions before long break
}

export interface TimerState {
  status: TimerStatus;
  sessionType: SessionType;
  timeRemaining: number; // in seconds
  completedSessions: number;
  settings: TimerSettings;
  /** Set to the session type that just completed; null otherwise. */
  sessionJustCompleted: SessionType | null;
}
