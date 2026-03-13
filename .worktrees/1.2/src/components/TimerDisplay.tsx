import type { TimerStatus } from '../types/timer';
import styles from './TimerDisplay.module.css';

interface Props {
  timeRemaining: number; // seconds
  status: TimerStatus;
}

export function TimerDisplay({ timeRemaining, status }: Props) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className={`${styles.display} ${styles[status]}`} aria-label={`${formatted} remaining`}>
      <span className={styles.time}>{formatted}</span>
    </div>
  );
}
