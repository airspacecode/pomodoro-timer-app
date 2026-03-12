import { useState } from 'react';
import type { TimerSettings } from '../types/timer';
import styles from './DurationSettings.module.css';

interface Props {
  settings: TimerSettings;
  onUpdate: (settings: Partial<TimerSettings>) => void;
  disabled?: boolean;
}

interface FieldConfig {
  key: keyof TimerSettings;
  label: string;
  min: number;
  max: number;
  unit: string;
}

const FIELDS: FieldConfig[] = [
  { key: 'workDuration', label: 'Focus', min: 1, max: 60, unit: 'min' },
  { key: 'shortBreakDuration', label: 'Short Break', min: 1, max: 30, unit: 'min' },
  { key: 'longBreakDuration', label: 'Long Break', min: 1, max: 60, unit: 'min' },
  { key: 'longBreakInterval', label: 'Long Break Every', min: 1, max: 10, unit: 'sessions' },
];

export function DurationSettings({ settings, onUpdate, disabled }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.toggle}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label="Toggle settings"
      >
        <SettingsIcon />
        <span>Settings</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className={styles.panel}>
          {FIELDS.map(({ key, label, min, max, unit }) => (
            <div key={key} className={styles.field}>
              <label className={styles.label} htmlFor={`setting-${key}`}>
                {label}
              </label>
              <div className={styles.stepper}>
                <button
                  className={styles.step}
                  onClick={() => onUpdate({ [key]: Math.max(min, settings[key] - 1) })}
                  disabled={disabled || settings[key] <= min}
                  aria-label={`Decrease ${label}`}
                >
                  −
                </button>
                <input
                  id={`setting-${key}`}
                  className={styles.input}
                  type="number"
                  min={min}
                  max={max}
                  value={settings[key]}
                  disabled={disabled}
                  onChange={e => {
                    const val = Math.min(max, Math.max(min, Number(e.target.value)));
                    if (!isNaN(val)) onUpdate({ [key]: val });
                  }}
                />
                <span className={styles.unit}>{unit}</span>
                <button
                  className={styles.step}
                  onClick={() => onUpdate({ [key]: Math.min(max, settings[key] + 1) })}
                  disabled={disabled || settings[key] >= max}
                  aria-label={`Increase ${label}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {disabled && (
            <p className={styles.hint}>Pause or reset the timer to change settings.</p>
          )}
        </div>
      )}
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.07 7.07 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.04.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
    >
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
}
