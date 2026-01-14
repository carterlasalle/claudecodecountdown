/**
 * page.tsx
 * 
 * Main page for Claude Code Countdown.
 * Simple interface: enter UTC time, get countdown with SMS notifications.
 * Update when: changing layout or adding features.
 */

'use client';

import { useState, useCallback } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import TimeInput from '@/components/TimeInput';
import PhoneInput from '@/components/PhoneInput';

interface ScheduleResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default function Home() {
  const [targetTime, setTargetTime] = useState<Date | null>(null);
  const [isTimeValid, setIsTimeValid] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(false);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [smsStatus, setSmsStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const handleTimeChange = useCallback((time: Date | null, isValid: boolean) => {
    setTargetTime(time);
    setIsTimeValid(isValid);
    if (!isValid) {
      setIsCountdownActive(false);
    }
  }, []);

  const handlePhoneChange = useCallback((phone: string, isValid: boolean) => {
    setPhoneNumber(phone);
    setIsPhoneValid(isValid);
  }, []);

  const handleStartCountdown = async () => {
    if (!targetTime || !isTimeValid) return;
    
    setIsCountdownActive(true);

    // Schedule SMS if phone is valid
    if (isPhoneValid && phoneNumber) {
      setIsScheduling(true);
      setSmsStatus({ type: null, message: '' });

      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const response = await fetch('/api/schedule-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            accessTime: targetTime.toISOString(),
            timezone,
          }),
        });

        const data: ScheduleResponse = await response.json();

        if (data.success) {
          setSmsStatus({ type: 'success', message: 'SMS notifications scheduled!' });
        } else {
          setSmsStatus({ type: 'error', message: data.error || 'Failed to schedule SMS' });
        }
      } catch {
        setSmsStatus({ type: 'error', message: 'Network error. SMS not scheduled.' });
      } finally {
        setIsScheduling(false);
      }
    }
  };

  const handleCountdownComplete = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Claude Code Access Restored!', {
        body: 'Your Claude Code access is now available.',
        icon: '/favicon.ico',
      });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Claude Code Countdown
          </h1>
          <p className="text-muted-foreground">
            Track when your access returns
          </p>
        </header>

        {/* Main content */}
        <div className="space-y-6">
          {/* Countdown Timer */}
          <CountdownTimer
            targetTime={targetTime}
            isActive={isCountdownActive}
            onComplete={handleCountdownComplete}
          />

          {/* Time Input */}
          <TimeInput
            onTimeChange={handleTimeChange}
            onStartCountdown={handleStartCountdown}
            disabled={isScheduling}
          />

          {/* SMS Notifications */}
          <PhoneInput
            onPhoneChange={handlePhoneChange}
            disabled={isScheduling}
          />

          {/* SMS Status */}
          {smsStatus.type && (
            <div
              className={`card p-4 text-sm ${
                smsStatus.type === 'success'
                  ? 'bg-secondary'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {smsStatus.type === 'success' ? '✓ ' : '✗ '}
              {smsStatus.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Enter the time shown in Claude Code&apos;s &quot;Limit reached · resets [time] (UTC)&quot; message
          </p>
          <p className="mt-4 text-xs">
            SMS notifications via Twilio · <a href="https://github.com/carterlasalle" className="underline hover:text-foreground">Built by Carter LaSalle</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
