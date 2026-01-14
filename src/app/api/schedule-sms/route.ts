/**
 * route.ts
 * 
 * API endpoint for scheduling SMS notifications via Twilio.
 * Accepts phone number and target access time, schedules two messages.
 * Update when: changing scheduling logic, adding validation, or modifying response format.
 */

import { NextRequest, NextResponse } from 'next/server';
import { scheduleAccessNotifications } from '@/lib/twilio';

interface ScheduleRequest {
  phoneNumber: string;
  accessTime: string; // ISO 8601 format
  timezone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ScheduleRequest = await request.json();
    
    // Validate required fields
    if (!body.phoneNumber || !body.accessTime || !body.timezone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: phoneNumber, accessTime, timezone' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic E.164 check)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(body.phoneNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' },
        { status: 400 }
      );
    }

    // Parse access time
    const accessTime = new Date(body.accessTime);
    if (isNaN(accessTime.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid access time format. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    // Check if time is in the future
    if (accessTime <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Access time must be in the future.' },
        { status: 400 }
      );
    }

    // Check if time is within 7 days (Twilio limit for scheduled messages)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    if (accessTime > sevenDaysFromNow) {
      return NextResponse.json(
        { success: false, error: 'Access time must be within 7 days from now (Twilio limitation).' },
        { status: 400 }
      );
    }

    // Schedule the notifications
    const result = await scheduleAccessNotifications({
      phoneNumber: body.phoneNumber,
      accessTime,
      timezone: body.timezone,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMS notifications scheduled successfully!',
        messageIds: result.messageIds,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
