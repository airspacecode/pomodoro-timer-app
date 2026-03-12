import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '../hooks/useNotifications';

// Mock the Notification API
const mockNotification = vi.fn();
mockNotification.permission = 'default';
mockNotification.requestPermission = vi.fn();

Object.defineProperty(window, 'Notification', {
  value: mockNotification,
  writable: true,
});

// Mock AudioContext
const mockOscillator = {
  connect: vi.fn(),
  frequency: { setValueAtTime: vi.fn() },
  type: '',
  start: vi.fn(),
  stop: vi.fn(),
};
const mockGainNode = {
  connect: vi.fn(),
  gain: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
};
const mockAudioContext = {
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGainNode),
  destination: {},
  currentTime: 0,
  close: vi.fn(),
};
Object.defineProperty(window, 'AudioContext', {
  value: vi.fn(() => mockAudioContext),
  writable: true,
});

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotification.permission = 'default';
    mockNotification.requestPermission = vi.fn().mockResolvedValue('granted');
  });

  it('returns initial permission state', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.permission).toBe('default');
  });

  it('updates permission after requestPermission', async () => {
    const { result } = renderHook(() => useNotifications());
    await act(async () => {
      await result.current.requestPermission();
    });
    expect(mockNotification.requestPermission).toHaveBeenCalled();
    expect(result.current.permission).toBe('granted');
  });

  it('does not fire browser notification when permission is default', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.notify('work');
    });
    // Notification constructor should not have been called as a constructor
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('fires browser notification when permission is granted', () => {
    mockNotification.permission = 'granted';
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.notify('work');
    });
    expect(mockNotification).toHaveBeenCalledWith(
      'Focus session complete!',
      expect.objectContaining({ body: 'Great work. Time to take a break.' })
    );
  });

  it('fires browser notification with correct message for short-break', () => {
    mockNotification.permission = 'granted';
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.notify('short-break');
    });
    expect(mockNotification).toHaveBeenCalledWith(
      'Break over!',
      expect.objectContaining({ body: 'Ready to get back to work?' })
    );
  });

  it('fires browser notification with correct message for long-break', () => {
    mockNotification.permission = 'granted';
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.notify('long-break');
    });
    expect(mockNotification).toHaveBeenCalledWith(
      'Long break over!',
      expect.objectContaining({ body: 'Recharged and ready to focus again.' })
    );
  });

  it('always plays audio even without notification permission', () => {
    mockNotification.permission = 'default';
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.notify('work');
    });
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });
});
