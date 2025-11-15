import { randomUUID } from 'crypto';

/**
 * Generates a temporary Google Meet link using UUID
 * TODO: Replace with real Google Calendar API integration
 */
export function generateGoogleMeetLink(): string {
  const uuid = randomUUID();
  const meetCode = uuid.substring(0, 10).replace(/-/g, '');
  return `https://meet.google.com/${meetCode.substring(0, 3)}-${meetCode.substring(3, 7)}-${meetCode.substring(7, 10)}`;
}
