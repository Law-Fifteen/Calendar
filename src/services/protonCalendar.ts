import type { CalendarEvent } from '@/types'
import { SOURCE_COLORS } from '@/types'

export async function fetchProtonIcsEvents(icsUrl: string): Promise<CalendarEvent[]> {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(icsUrl)}`
  const response = await fetch(proxyUrl)

  if (!response.ok) {
    throw new Error(`ICS fetch error: ${response.status}`)
  }

  const text = await response.text()
  return parseIcsContent(text)
}

export function parseProtonIcsFile(fileContent: string): CalendarEvent[] {
  return parseIcsContent(fileContent)
}

export function loadProtonFromStorage(): CalendarEvent[] {
  const stored = localStorage.getItem('proton_ics_data')
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveProtonToStorage(events: CalendarEvent[]) {
  const serializable = events.map(e => ({
    ...e,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
  }))
  localStorage.setItem('proton_ics_data', JSON.stringify(serializable))
  localStorage.setItem('proton_ics_date', new Date().toISOString())
}

export function getProtonLastUpload(): string | null {
  return localStorage.getItem('proton_ics_date')
}

function parseIcsContent(content: string): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const lines = content.split(/\r?\n/)
  let currentEvent: Partial<CalendarEvent> | null = null
  let inAlarm = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === 'BEGIN:VALARM') {
      inAlarm = true
      continue
    }
    if (trimmed === 'END:VALARM') {
      inAlarm = false
      continue
    }
    if (inAlarm) continue

    if (trimmed === 'BEGIN:VEVENT') {
      currentEvent = { source: 'proton', color: SOURCE_COLORS.proton }
    } else if (trimmed === 'END:VEVENT' && currentEvent) {
      if (currentEvent.start && currentEvent.end && currentEvent.id) {
        events.push(currentEvent as CalendarEvent)
      }
      currentEvent = null
    } else if (currentEvent) {
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex === -1) continue

      const key = trimmed.substring(0, colonIndex)
      const value = trimmed.substring(colonIndex + 1)

      if (key === 'UID') {
        currentEvent.id = `proton-${value}`
      } else if (key === 'SUMMARY') {
        currentEvent.title = unescapeIcs(value)
      } else if (key === 'DESCRIPTION') {
        currentEvent.description = unescapeIcs(value)
      } else if (key === 'LOCATION') {
        currentEvent.location = unescapeIcs(value)
      } else if (key.startsWith('DTSTART')) {
        currentEvent.start = parseIcsDate(value, key)
        if (key.includes('VALUE=DATE') && !key.includes('DTSTART')) {
          currentEvent.allDay = true
        }
      } else if (key.startsWith('DTEND')) {
        currentEvent.end = parseIcsDate(value, key)
      }
    }
  }

  return events
}

function parseIcsDate(value: string, key: string): Date {
  const clean = value.replace(/[^0-9T]/g, '')

  if (clean.length === 8) {
    const year = parseInt(clean.substring(0, 4))
    const month = parseInt(clean.substring(4, 6)) - 1
    const day = parseInt(clean.substring(6, 8))
    return new Date(year, month, day)
  }

  const year = parseInt(clean.substring(0, 4))
  const month = parseInt(clean.substring(4, 6)) - 1
  const day = parseInt(clean.substring(6, 8))
  const hour = parseInt(clean.substring(9, 11)) || 0
  const minute = parseInt(clean.substring(11, 13)) || 0
  const second = parseInt(clean.substring(13, 15)) || 0

  const date = new Date(year, month, day, hour, minute, second)

  if (key.includes('TZID=')) {
    const tzMatch = key.match(/TZID=([^:]+)/)
    if (tzMatch) {
      try {
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tzMatch[1] }))
        const offset = tzDate.getTime() - date.getTime()
        return new Date(date.getTime() + offset)
      } catch {
        return date
      }
    }
  }

  if (clean.endsWith('Z')) {
    return new Date(date.toISOString())
  }

  return date
}

function unescapeIcs(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}
