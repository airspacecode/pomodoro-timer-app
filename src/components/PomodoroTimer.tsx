import { useTimer } from '../hooks/useTimer';
import { formatTime, getSessionLabel } from '../utils/timerUtils';
import type { SessionType } from '../types/timer';
import './PomodoroTimer.css';

export function PomodoroTimer() {
  const timer = useTimer();

  const sessionDots = Array.from({ length: timer.settings.sessionsBeforeLongBreak }, (_, i) => (
    <span
      key={i}
      className={`session-dot ${i < (timer.completedWorkSessions % timer.settings.sessionsBeforeLongBreak) ? 'filled' : ''}`}
    />
  ));

  return (
    <div className="pomodoro-timer">
      <h1 className="app-title">Pomodoro Timer</h1>

      <div className="session-tabs">
        {(['work', 'shortBreak', 'longBreak'] as SessionType[]).map((type) => (
          <button
            key={type}
            className={`tab ${timer.sessionType === type ? 'active' : ''}`}
            disabled
          >
            {getSessionLabel(type)}
          </button>
        ))}
      </div>

      <div className={`timer-display ${timer.sessionType}`}>
        <span className="time">{formatTime(timer.timeRemaining)}</span>
      </div>

      <div className="session-progress">{sessionDots}</div>
      <p className="session-info">
        Completed sessions: {timer.completedWorkSessions}
      </p>

      <div className="controls">
        {timer.status === 'running' ? (
          <button className="btn btn-pause" onClick={timer.pause}>Pause</button>
        ) : (
          <button className="btn btn-start" onClick={timer.start}>
            {timer.status === 'paused' ? 'Resume' : 'Start'}
          </button>
        )}
        <button className="btn btn-reset" onClick={timer.reset}>Reset</button>
        <button className="btn btn-skip" onClick={timer.skipSession}>Skip</button>
      </div>
    </div>
  );
}
