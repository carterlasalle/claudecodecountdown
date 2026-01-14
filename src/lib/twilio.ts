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
  scheduledMessages?: { type: string; scheduledFor: string }[];
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
 * Twilio requires scheduled messages to be at least 15 minutes in the future.
 */
export async function scheduleAccessNotifications(
  params: ScheduleParams
): Promise<ScheduleResult> {
  // Validate credentials
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
  const scheduledMessages: { type: string; scheduledFor: string }[] = [];

  // Calculate times
  const now = new Date();
  const fiveMinutesBefore = new Date(params.accessTime.getTime() - 5 * 60 * 1000);
  
  // Twilio requires scheduled messages to be at least 15 minutes in the future
  // Adding 1 minute buffer to be safe
  const minimumScheduleTime = new Date(now.getTime() + 16 * 60 * 1000);

  // Format the access time for display in the message
  const accessTimeFormatted = params.accessTime.toLocaleTimeString('en-US', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  try {
    // Schedule 5-minute warning if it's far enough in the future
    if (fiveMinutesBefore >= minimumScheduleTime) {
      const warningMessage = await client.messages.create({
        body: `Claude Code Countdown: Heads up - your access returns in about 5 minutes (${accessTimeFormatted} UTC). Get ready to code! - claudecodecountdown.com`,
        messagingServiceSid,
        to: params.phoneNumber,
        scheduleType: 'fixed',
        sendAt: fiveMinutesBefore,
      });
      messageIds.push(warningMessage.sid);
      scheduledMessages.push({
        type: '5-minute warning',
        scheduledFor: fiveMinutesBefore.toISOString(),
      });
    }

    // Schedule access time notification if it's far enough in the future
    if (params.accessTime >= minimumScheduleTime) {
      const accessMessage = await client.messages.create({
        body: `Claude Code Countdown: Your access has been restored. Time to get back to coding! - claudecodecountdown.com`,
        messagingServiceSid,
        to: params.phoneNumber,
        scheduleType: 'fixed',
        sendAt: params.accessTime,
      });
      messageIds.push(accessMessage.sid);
      scheduledMessages.push({
        type: 'access restored',
        scheduledFor: params.accessTime.toISOString(),
      });
    }

    // Check if any messages were scheduled
    if (messageIds.length === 0) {
      return {
        success: false,
        error: 'The selected time must be at least 16 minutes in the future for scheduled messages.',
      };
    }

    return {
      success: true,
      messageIds,
      scheduledMessages,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Twilio scheduling error:', error);
    return {
      success: false,
      error: `Failed to schedule SMS: ${errorMessage}`,
    };
  }
}
