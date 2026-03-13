import { useEffect, useRef } from 'react';
import type { SessionType } from '../types/timer';
import type { NotificationPermission } from '../hooks/useNotifications';
import styles from './CompletionToast.module.css';

interface Props {
  completedSession: SessionType | null;
  notificationPermission: NotificationPermission;
  onDismiss: () => void;
  onRequestPermission: () => void;
}

const SESSION_COPY: Record<SessionType, { heading: string; message: string; emoji: string }> = {
  'work': {
    heading: 'Focus session complete!',
    message: 'Great work — time for a break.',
    emoji: '🎯',
  },
  'short-break': {
    heading: 'Break over!',
    message: 'Ready to get back to it?',
    emoji: '☕',
  },
  'long-break': {
    heading: 'Long break over!',
    message: 'Recharged and ready to focus.',
    emoji: '✨',
  },
};

export function CompletionToast({
  completedSession,
  notificationPermission,
  onDismiss,
  onRequestPermission,
}: Props) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!completedSession) return;
    const id = setTimeout(() => dismissRef.current(), 8000);
    return () => clearTimeout(id);
  }, [completedSession]);

  if (!completedSession) return null;

  const { heading, message, emoji } = SESSION_COPY[completedSession];
  const showPermissionPrompt =
    notificationPermission === 'default' || notificationPermission === 'unsupported';

  return (
    <div
      className={`${styles.toast} ${styles[completedSession.replace('-', '')]}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={styles.content}>
        <span className={styles.emoji} aria-hidden="true">{emoji}</span>
        <div className={styles.text}>
          <strong className={styles.heading}>{heading}</strong>
          <span className={styles.message}>{message}</span>
          {showPermissionPrompt && notificationPermission === 'default' && (
            <button
              className={styles.permissionBtn}
              onClick={onRequestPermission}
              aria-label="Enable browser notifications"
            >
              Enable desktop notifications
            </button>
          )}
        </div>
        <button
          className={styles.close}
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      </div>
    </div>
  );
}
