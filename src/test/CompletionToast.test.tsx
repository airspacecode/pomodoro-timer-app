import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompletionToast } from '../components/CompletionToast';

describe('CompletionToast', () => {
  it('renders nothing when completedSession is null', () => {
    const { container } = render(
      <CompletionToast
        completedSession={null}
        notificationPermission="granted"
        onDismiss={vi.fn()}
        onRequestPermission={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders alert for work session completion', () => {
    render(
      <CompletionToast
        completedSession="work"
        notificationPermission="granted"
        onDismiss={vi.fn()}
        onRequestPermission={vi.fn()}
      />
    );
    expect(screen.getByText('Focus session complete!')).toBeInTheDocument();
    expect(screen.getByText('Great work — time for a break.')).toBeInTheDocument();
  });

  it('renders alert for short-break completion', () => {
    render(
      <CompletionToast
        completedSession="short-break"
        notificationPermission="granted"
        onDismiss={vi.fn()}
        onRequestPermission={vi.fn()}
      />
    );
    expect(screen.getByText('Break over!')).toBeInTheDocument();
  });

  it('renders alert for long-break completion', () => {
    render(
      <CompletionToast
        completedSession="long-break"
        notificationPermission="granted"
        onDismiss={vi.fn()}
        onRequestPermission={vi.fn()}
      />
    );
    expect(screen.getByText('Long break over!')).toBeInTheDocument();
  });

  it('calls onDismiss when close button is clicked', async () => {
    const onDismiss = vi.fn();
    render(
      <CompletionToast
        completedSession="work"
        notificationPermission="granted"
        onDismiss={onDismiss}
        onRequestPermission={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('shows permission prompt when permission is default', () => {
    render(
      <CompletionToast
        completedSession="work"
        notificationPermission="default"
        onDismiss={vi.fn()}
        onRequestPermission={vi.fn()}
      />
    );
    expect(screen.getByText('Enable desktop notifications')).toBeInTheDocument();
  });

  it('hides permission prompt when permission is granted', () => {
    render(
      <CompletionToast
        completedSession="work"
        notificationPermission="granted"
        onDismiss={vi.fn()}
        onRequestPermission={vi.fn()}
      />
    );
    expect(screen.queryByText('Enable desktop notifications')).not.toBeInTheDocument();
  });

  it('calls onRequestPermission when permission button is clicked', async () => {
    const onRequestPermission = vi.fn();
    render(
      <CompletionToast
        completedSession="work"
        notificationPermission="default"
        onDismiss={vi.fn()}
        onRequestPermission={onRequestPermission}
      />
    );
    await userEvent.click(screen.getByText('Enable desktop notifications'));
    expect(onRequestPermission).toHaveBeenCalled();
  });

  it('auto-dismisses after 8 seconds', async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <CompletionToast
        completedSession="work"
        notificationPermission="granted"
        onDismiss={onDismiss}
        onRequestPermission={vi.fn()}
      />
    );
    act(() => { vi.advanceTimersByTime(8000); });
    expect(onDismiss).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
