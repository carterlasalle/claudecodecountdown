/**
 * CountdownTimer.tsx
 * 
 * Displays countdown to access restoration time.
 * Shows hours, minutes, seconds remaining with JetBrains Mono font.
 * Update when: changing display format or completion behavior.
 */

'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetTime: Date | null;
  isActive: boolean;
  onComplete?: () => void;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(targetTime: Date): TimeRemaining {
  const now = new Date().getTime();
  const target = targetTime.getTime();
  const total = target - now;

  if (total <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    hours: Math.floor(total / (1000 * 60 * 60)),
    minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((total % (1000 * 60)) / 1000),
    total,
  };
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

export default function CountdownTimer({ targetTime, isActive, onComplete }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (!targetTime || !isActive) {
      setTimeRemaining(null);
      setHasCompleted(false);
      return;
    }

    const updateCountdown = () => {
      const remaining = calculateTimeRemaining(targetTime);
      setTimeRemaining(remaining);

      if (remaining.total <= 0 && !hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime, isActive, hasCompleted, onComplete]);

  if (!isActive || !targetTime) {
    return null;
  }

  if (hasCompleted) {
    return (
      <div className="card p-8 text-center bg-secondary">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Access Restored!</h2>
        <p className="text-muted-foreground">Claude Code is ready to use again.</p>
      </div>
    );
  }

  if (!timeRemaining) {
    return null;
  }

  // Format target time for display
  const targetTimeDisplay = targetTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  });

  return (
    <div className="card p-6">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-1">Access returns at</p>
        <p className="text-xl font-semibold">{targetTimeDisplay} UTC</p>
      </div>
      
      <div className="flex justify-center items-center gap-2 countdown-font">
        <TimeBlock value={timeRemaining.hours} label="hrs" />
        <span className="text-3xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={timeRemaining.minutes} label="min" />
        <span className="text-3xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={timeRemaining.seconds} label="sec" />
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Time remaining until access is restored
      </p>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-primary text-primary-foreground px-4 py-3 min-w-[70px]" style={{ boxShadow: '3px 3px 0px 0px black' }}>
        <span className="text-3xl font-bold tabular-nums">
          {padZero(value)}
        </span>
      </div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}
