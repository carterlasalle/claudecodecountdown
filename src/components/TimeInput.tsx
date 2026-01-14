/**
 * TimeInput.tsx
 * 
 * Simple text input for entering UTC time in HH:MM AM/PM format.
 * Parses times like "8pm", "2:30 PM", "11:45 AM" into Date objects.
 * Update when: changing time parsing logic or input styling.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface TimeInputProps {
  onTimeChange: (time: Date | null, isValid: boolean) => void;
  onStartCountdown: () => void;
  disabled?: boolean;
}

/**
 * Parse time string like "8pm", "2:30 PM", "11:45 AM" into hours and minutes
 */
function parseTimeString(input: string): { hours: number; minutes: number } | null {
  const cleaned = input.trim().toLowerCase().replace(/\s+/g, '');
  
  // Match patterns like: 8pm, 8:30pm, 2:30 PM, 11:45AM, 8 PM
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  
  if (!match) return null;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].toLowerCase();
  
  // Validate ranges
  if (hours < 1 || hours > 12) return null;
  if (minutes < 0 || minutes > 59) return null;
  
  // Convert to 24-hour format
  if (period === 'am') {
    if (hours === 12) hours = 0;
  } else {
    if (hours !== 12) hours += 12;
  }
  
  return { hours, minutes };
}

export default function TimeInput({ onTimeChange, onStartCountdown, disabled }: TimeInputProps) {
  const [timeString, setTimeString] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  const validateAndParse = useCallback((value: string) => {
    if (!value.trim()) {
      setError('');
      setIsValid(false);
      onTimeChange(null, false);
      return;
    }

    const parsed = parseTimeString(value);
    
    if (!parsed) {
      setError('Please enter time in format: HH:MM AM/PM (e.g., 2:30 PM)');
      setIsValid(false);
      onTimeChange(null, false);
      return;
    }

    // Create UTC date for today or tomorrow
    const now = new Date();
    const targetDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      parsed.hours,
      parsed.minutes,
      0
    ));

    // If time has already passed today, assume tomorrow
    if (targetDate <= now) {
      targetDate.setUTCDate(targetDate.getUTCDate() + 1);
    }

    setError('');
    setIsValid(true);
    onTimeChange(targetDate, true);
  }, [onTimeChange]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      validateAndParse(timeString);
    }, 300);

    return () => clearTimeout(debounce);
  }, [timeString, validateAndParse]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      onStartCountdown();
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-lg font-semibold">Set Access Return Time</h2>
      </div>
      
      <p className="text-muted-foreground text-sm mb-4">
        Enter the UTC time when your access returns
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Time (UTC)</label>
          <input
            type="text"
            value={timeString}
            onChange={(e) => setTimeString(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="2:30 PM"
            disabled={disabled}
            className="w-full px-4 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-describedby="time-format-hint"
            autoComplete="off"
          />
          <p id="time-format-hint" className="text-xs text-muted-foreground mt-1">
            Format: HH:MM AM/PM (e.g., 2:30 PM, 11:45 AM)
          </p>
        </div>

        {error && (
          <div className="card p-3 bg-destructive/10 border-destructive">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={onStartCountdown}
          disabled={!isValid || disabled}
          className="btn-primary w-full py-3 font-semibold text-base"
        >
          Start Countdown
        </button>
      </div>
    </div>
  );
}
