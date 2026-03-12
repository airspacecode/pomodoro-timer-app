export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerSettings {
  workDuration: number;       // in seconds
  shortBreakDuration: number; // in seconds
  longBreakDuration: number;  // in seconds
  sessionsBeforeLongBreak: number;
}

export interface TimerState {
  status: TimerStatus;
  sessionType: SessionType;
  timeRemaining: number;       // in seconds
  completedWorkSessions: number;
  settings: TimerSettings;
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  skipSession: () => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
}
