import type { CalendarEvent } from '@/types'
import { SOURCE_COLORS } from '@/types'

export async function fetchGoogleCalendarEvents(
  accessToken: string,
  apiKey: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
  })

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (response.status === 401) {
    throw new Error('GOOGLE_TOKEN_EXPIRED')
  }

  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${response.status}`)
  }

  const data = await response.json()

  return (data.items || []).map((item: any) => ({
    id: `google-${item.id}`,
    title: item.summary || 'Untitled',
    description: item.description,
    location: item.location,
    start: new Date(item.start.dateTime || item.start.date),
    end: new Date(item.end.dateTime || item.end.date),
    source: 'google' as const,
    color: SOURCE_COLORS.google,
    allDay: !item.start.dateTime,
    link: item.htmlLink,
  }))
}

export function getGoogleAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export function parseGoogleCallback(hash: string): string | null {
  const params = new URLSearchParams(hash.substring(1))
  return params.get('access_token')
}
