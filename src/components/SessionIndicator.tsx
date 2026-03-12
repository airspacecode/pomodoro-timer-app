import type { SessionType } from '../types/timer';
import styles from './SessionIndicator.module.css';

interface Props {
  sessionType: SessionType;
  completedSessions: number;
  longBreakInterval: number;
}

const SESSION_LABELS: Record<SessionType, string> = {
  'work': 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

export function SessionIndicator({ sessionType, completedSessions, longBreakInterval }: Props) {
  const label = SESSION_LABELS[sessionType];

  return (
    <div className={styles.container}>
      <span className={`${styles.badge} ${styles[sessionType.replace('-', '')]}`}>
        {label}
      </span>
      <div className={styles.dots} aria-label={`${completedSessions} sessions completed`}>
        {Array.from({ length: longBreakInterval }, (_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i < completedSessions % longBreakInterval || (completedSessions > 0 && completedSessions % longBreakInterval === 0 && i < longBreakInterval) ? styles.dotFilled : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
