/**
 * PhoneInput.tsx
 * 
 * Phone number input with localStorage caching.
 * Displays saved number with edit icon, allows modification.
 * Update when: changing validation rules or styling.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'claude_countdown_phone';

interface PhoneInputProps {
  onPhoneChange: (phone: string, isValid: boolean) => void;
  disabled?: boolean;
}

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+${digits}`;
  }
  if (phone.startsWith('+')) {
    return phone;
  }
  return `+${digits}`;
}

export default function PhoneInput({ onPhoneChange, disabled }: PhoneInputProps) {
  const [phone, setPhone] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [hasCachedPhone, setHasCachedPhone] = useState<boolean>(false);

  // Load cached phone on mount
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      setPhone(cached);
      setHasCachedPhone(true);
      setIsEditing(false);
      const e164 = toE164(cached);
      onPhoneChange(e164, e164.length >= 11);
    } else {
      setIsEditing(true);
    }
  }, [onPhoneChange]);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    const e164 = toE164(value);
    const isValid = e164.length >= 11 && /^\+[1-9]\d{9,14}$/.test(e164);
    onPhoneChange(e164, isValid);
  };

  const handleSave = useCallback(() => {
    const e164 = toE164(phone);
    if (e164.length >= 11) {
      localStorage.setItem(STORAGE_KEY, phone);
      setHasCachedPhone(true);
      setIsEditing(false);
    }
  }, [phone]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const e164Phone = toE164(phone);
  const isValidPhone = e164Phone.length >= 11 && /^\+[1-9]\d{9,14}$/.test(e164Phone);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <h2 className="text-lg font-semibold">SMS Notifications</h2>
      </div>
      
      <p className="text-muted-foreground text-sm mb-4">
        Get notified 5 minutes before and when access is restored
      </p>

      {!isEditing && hasCachedPhone ? (
        // Display mode - show saved phone
        <div 
          className="flex items-center justify-between bg-secondary p-4 cursor-pointer hover:bg-muted transition-colors"
          onClick={handleEdit}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
        >
          <div>
            <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
            <p className="text-lg font-medium">{formatPhoneDisplay(phone)}</p>
          </div>
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      ) : (
        // Edit mode
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder="(555) 123-4567"
              disabled={disabled}
              className="w-full px-4 py-3 text-lg disabled:opacity-50"
              autoComplete="tel"
            />
          </div>
          
          {phone && !isValidPhone && (
            <p className="text-destructive text-sm">
              Please enter a valid phone number
            </p>
          )}

          {isValidPhone && hasCachedPhone && (
            <button
              onClick={handleSave}
              disabled={disabled}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Press Enter to save
            </button>
          )}
        </div>
      )}
    </div>
  );
}
