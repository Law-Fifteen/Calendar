import type { CalendarEvent } from '@/types'
import { SOURCE_COLORS } from '@/types'

export async function fetchCalendlyEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const response = await fetch(
    `https://api.calendly.com/scheduled_events?status=active&min_start_time=${timeMin.toISOString()}&max_start_time=${timeMax.toISOString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (response.status === 401) {
    throw new Error('CALENDLY_TOKEN_EXPIRED')
  }

  if (!response.ok) {
    throw new Error(`Calendly API error: ${response.status}`)
  }

  const data = await response.json()

  return (data.collection || []).map((item: any) => ({
    id: `calendly-${item.uri.split('/').pop()}`,
    title: item.name || 'Calendly Event',
    description: item.description,
    location: item.location,
    start: new Date(item.start_time),
    end: new Date(item.end_time),
    source: 'calendly' as const,
    color: SOURCE_COLORS.calendly,
    link: item.booking_url,
  }))
}

export function generateCalendlyCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function generateCalendlyCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function getCalendlyAuthUrl(
  clientId: string,
  redirectUri: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: 'scheduled_events:read',
  })
  return `https://auth.calendly.com/oauth/authorize?${params}`
}

export function parseCalendlyCallback(search: string): string | null {
  const params = new URLSearchParams(search)
  return params.get('code')
}
