/**
 * twilio.ts
 * 
 * Twilio client helper for sending scheduled SMS messages.
 * Handles message scheduling for the countdown notifications.
 * Update when: changing SMS logic, message templates, or adding new notification types.
 * 
 * NOTE: Scheduled messages require a Messaging Service SID, not just a phone number.
 * Create one at: https://console.twilio.com/us1/develop/sms/services
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

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
 * 
 * Requires a Twilio Messaging Service for scheduled messages.
 */
export async function scheduleAccessNotifications(
  params: ScheduleParams
): Promise<ScheduleResult> {
  if (!accountSid || !authToken) {
    return {
      success: false,
      error: 'Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.',
    };
  }

  if (!messagingServiceSid) {
    return {
      success: false,
      error: 'TWILIO_MESSAGING_SERVICE_SID not configured. Scheduled messages require a Messaging Service. Create one at https://console.twilio.com/us1/develop/sms/services',
    };
  }

  const client = twilio(accountSid, authToken);
  const messageIds: string[] = [];

  const fiveMinutesBefore = new Date(params.accessTime.getTime() - 5 * 60 * 1000);
  const now = new Date();

  // Twilio requires scheduled messages to be at least 15 minutes in the future
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

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
    // Schedule 5-minute warning (only if it's at least 15 min in the future)
    if (fiveMinutesBefore > fifteenMinutesFromNow) {
      const warningMessage = await client.messages.create({
        body: `⏰ Claude Code Access Alert: Your access will be restored in 5 MINUTES! (${accessTimeFormatted} UTC)`,
        messagingServiceSid,
        to: params.phoneNumber,
        scheduleType: 'fixed',
        sendAt: fiveMinutesBefore,
      });
      messageIds.push(warningMessage.sid);
    }

    // Schedule exact time notification (only if it's at least 15 min in the future)
    if (params.accessTime > fifteenMinutesFromNow) {
      const accessMessage = await client.messages.create({
        body: `🎉 Claude Code Access RESTORED! You can now use Claude Code again. Time: ${accessTimeFormatted} UTC`,
        messagingServiceSid,
        to: params.phoneNumber,
        scheduleType: 'fixed',
        sendAt: params.accessTime,
      });
      messageIds.push(accessMessage.sid);
    }

    if (messageIds.length === 0) {
      return {
        success: false,
        error: 'The selected time must be at least 15 minutes in the future for scheduled messages.',
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
