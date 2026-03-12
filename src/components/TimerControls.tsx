import type { TimerStatus } from '../types/timer';
import styles from './TimerControls.module.css';

interface Props {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function TimerControls({ status, onStart, onPause, onReset, onSkip }: Props) {
  return (
    <div className={styles.controls}>
      <button
        className={`${styles.btn} ${styles.secondary}`}
        onClick={onReset}
        aria-label="Reset timer"
        title="Reset"
      >
        <ResetIcon />
      </button>

      {status === 'running' ? (
        <button
          className={`${styles.btn} ${styles.primary}`}
          onClick={onPause}
          aria-label="Pause timer"
        >
          <PauseIcon />
        </button>
      ) : (
        <button
          className={`${styles.btn} ${styles.primary}`}
          onClick={onStart}
          aria-label="Start timer"
        >
          <PlayIcon />
        </button>
      )}

      <button
        className={`${styles.btn} ${styles.secondary}`}
        onClick={onSkip}
        aria-label="Skip to next session"
        title="Skip"
      >
        <SkipIcon />
      </button>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
    </svg>
  );
}
