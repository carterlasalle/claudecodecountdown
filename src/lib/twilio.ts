/**
 * twilio.ts
 * 
 * Twilio client helper for sending scheduled SMS messages.
 * Handles message scheduling for the countdown notifications.
 * Update when: changing SMS logic, message templates, or adding new notification types.
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export interface ScheduleResult {
  success: boolean;
  messageIds?: string[];
  error?: string;
}

export interface ScheduleParams {
  phoneNumber: string;
  accessTime: Date;
  timezone: string;
}

/**
 * Schedules two SMS messages:
 * 1. Five minutes before access restoration
 * 2. At the exact access time
 */
export async function scheduleAccessNotifications(
  params: ScheduleParams
): Promise<ScheduleResult> {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    return {
      success: false,
      error: 'Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your environment variables.',
    };
  }

  const client = twilio(accountSid, authToken);
  const messageIds: string[] = [];

  const fiveMinutesBefore = new Date(params.accessTime.getTime() - 5 * 60 * 1000);
  const now = new Date();

  // Format the access time for display in the message
  const accessTimeFormatted = params.accessTime.toLocaleString('en-US', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric',
  });

  try {
    // Schedule 5-minute warning (only if it's in the future)
    if (fiveMinutesBefore > now) {
      const warningMessage = await client.messages.create({
        body: `⏰ Claude Code Access Alert: Your access will be restored in 5 MINUTES! (${accessTimeFormatted} UTC)`,
        from: twilioPhoneNumber,
        to: params.phoneNumber,
        scheduleType: 'fixed',
        sendAt: fiveMinutesBefore,
      });
      messageIds.push(warningMessage.sid);
    }

    // Schedule exact time notification (only if it's in the future)
    if (params.accessTime > now) {
      const accessMessage = await client.messages.create({
        body: `🎉 Claude Code Access RESTORED! You can now use Claude Code again. Time: ${accessTimeFormatted} UTC`,
        from: twilioPhoneNumber,
        to: params.phoneNumber,
        scheduleType: 'fixed',
        sendAt: params.accessTime,
      });
      messageIds.push(accessMessage.sid);
    }

    if (messageIds.length === 0) {
      return {
        success: false,
        error: 'The selected time is in the past. Please choose a future time.',
      };
    }

    return {
      success: true,
      messageIds,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: `Failed to schedule SMS: ${errorMessage}`,
    };
  }
}
