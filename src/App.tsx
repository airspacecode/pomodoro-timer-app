import { useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { useNotifications } from './hooks/useNotifications';
import { TimerDisplay } from './components/TimerDisplay';
import { SessionIndicator } from './components/SessionIndicator';
import { TimerControls } from './components/TimerControls';
import { DurationSettings } from './components/DurationSettings';
import { CompletionToast } from './components/CompletionToast';
import styles from './App.module.css';

const SESSION_THEME: Record<string, string> = {
  'work': 'theme-work',
  'short-break': 'theme-short-break',
  'long-break': 'theme-long-break',
};

export default function App() {
  const { state, start, pause, reset, skipSession, updateSettings, dismissAlert } = useTimer();
  const { permission, requestPermission, notify } = useNotifications();

  // Update document title with time remaining
  useEffect(() => {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    const time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const label =
      state.sessionType === 'work'
        ? 'Focus'
        : state.sessionType === 'short-break'
        ? 'Short Break'
        : 'Long Break';
    document.title = `${time} — ${label} | Pomodoro`;
  }, [state.timeRemaining, state.sessionType]);

  // Fire notifications whenever a session completes
  useEffect(() => {
    if (state.sessionJustCompleted) {
      notify(state.sessionJustCompleted);
    }
  }, [state.sessionJustCompleted, notify]);

  const themeClass = SESSION_THEME[state.sessionType] ?? 'theme-work';

  return (
    <div className={`${styles.app} ${themeClass}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pomodoro</h1>
      </header>

      <main className={styles.main}>
        <SessionIndicator
          sessionType={state.sessionType}
          completedSessions={state.completedSessions}
          longBreakInterval={state.settings.longBreakInterval}
        />

        <TimerDisplay
          timeRemaining={state.timeRemaining}
          status={state.status}
        />

        <TimerControls
          status={state.status}
          onStart={start}
          onPause={pause}
          onReset={reset}
          onSkip={skipSession}
        />

        <DurationSettings
          settings={state.settings}
          onUpdate={updateSettings}
          disabled={state.status === 'running'}
        />
      </main>

      <CompletionToast
        completedSession={state.sessionJustCompleted}
        notificationPermission={permission}
        onDismiss={dismissAlert}
        onRequestPermission={requestPermission}
      />
    </div>
  );
}
