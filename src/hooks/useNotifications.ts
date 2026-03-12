import { useCallback, useEffect, useRef, useState } from 'react';
import type { SessionType } from '../types/timer';

export type NotificationPermission = 'default' | 'granted' | 'denied' | 'unsupported';

const SESSION_MESSAGES: Record<SessionType, { title: string; body: string }> = {
  'work': {
    title: 'Focus session complete!',
    body: 'Great work. Time to take a break.',
  },
  'short-break': {
    title: 'Break over!',
    body: 'Ready to get back to work?',
  },
  'long-break': {
    title: 'Long break over!',
    body: 'Recharged and ready to focus again.',
  },
};

function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Plays a short completion chime via the Web Audio API. */
function playCompletionSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();

    const playTone = (freq: number, startAt: number, duration: number, gain: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, startAt);

      gainNode.gain.setValueAtTime(0, startAt);
      gainNode.gain.linearRampToValueAtTime(gain, startAt + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.05);
    };

    const now = ctx.currentTime;
    // Play three ascending tones: C5 → E5 → G5
    playTone(523.25, now, 0.3, 0.4);
    playTone(659.25, now + 0.18, 0.3, 0.4);
    playTone(783.99, now + 0.36, 0.5, 0.45);

    // Close AudioContext after sounds finish to free resources
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Web Audio API not available — silent fail
  }
}

export interface UseNotificationsReturn {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  notify: (completedSession: SessionType) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission as NotificationPermission;
  });

  const notificationRef = useRef<Notification | null>(null);

  // Keep permission state in sync if the user changes it externally
  useEffect(() => {
    if (!isNotificationSupported()) return;

    const syncPermission = () => {
      setPermission(Notification.permission as NotificationPermission);
    };

    // permissions.query lets us watch for external changes (best-effort)
    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'notifications' })
        .then(status => {
          status.addEventListener('change', syncPermission);
        })
        .catch(() => {/* ignore */});
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isNotificationSupported()) return;
    if (Notification.permission === 'denied') return;

    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermission);
  }, []);

  const notify = useCallback((completedSession: SessionType) => {
    // Always play the audio cue
    playCompletionSound();

    // Fire browser notification if permitted
    if (!isNotificationSupported() || Notification.permission !== 'granted') return;

    // Close any previous notification so we don't pile them up
    notificationRef.current?.close();

    const { title, body } = SESSION_MESSAGES[completedSession];
    const notification = new Notification(title, {
      body,
      icon: '/vite.svg',
      tag: 'pomodoro-session-complete',
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    notificationRef.current = notification;

    // Auto-close after 8 seconds
    setTimeout(() => notification.close(), 8000);
  }, []);

  return { permission, requestPermission, notify };
}
