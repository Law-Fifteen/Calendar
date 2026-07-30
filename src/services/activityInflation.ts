import type { CalendarEvent } from '@/types'
import { SOURCE_COLORS, INFLATED_TITLES } from '@/types'

interface InflationConfig {
  intensity: number
  minGapToFill: number
  maxBlocksPerDay: number
  workHours: { start: number; end: number }
  workDays: number[]
}

const defaultConfig: InflationConfig = {
  intensity: 0.7,
  minGapToFill: 30,
  maxBlocksPerDay: 4,
  workHours: { start: 9, end: 17 },
  workDays: [1, 2, 3, 4, 5],
}

export function generateRecurringEvents(startDate: Date, days: number): CalendarEvent[] {
  const events: CalendarEvent[] = []

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + d)
    const dayOfWeek = date.getDay()

    // Standup: Mon (1), Thu (4), Sun (0) at 8 AM, 1 hour
    if (dayOfWeek === 0 || dayOfWeek === 1 || dayOfWeek === 4) {
      const start = new Date(date)
      start.setHours(8, 0, 0, 0)
      const end = new Date(start)
      end.setHours(9, 0, 0, 0)

      events.push({
        id: `recurring-standup-${date.toDateString()}`,
        title: 'Standup',
        originalTitle: 'Standup',
        start,
        end,
        source: 'inflated',
        color: SOURCE_COLORS.inflated,
        description: 'Recurring standup meeting',
      })
    }

    // Deep Focus: every day, last 3 hours (5 PM - 8 PM)
    const focusStart = new Date(date)
    focusStart.setHours(17, 0, 0, 0)
    const focusEnd = new Date(date)
    focusEnd.setHours(20, 0, 0, 0)

    events.push({
      id: `recurring-deepfocus-${date.toDateString()}`,
      title: 'Deep Focus',
      originalTitle: 'Deep Focus',
      start: focusStart,
      end: focusEnd,
      source: 'inflated',
      color: SOURCE_COLORS.inflated,
      description: 'Recurring deep focus block',
    })
  }

  return events
}

export function generateInflatedEvents(
  existingEvents: CalendarEvent[],
  startDate: Date,
  days: number = 14,
  config: Partial<InflationConfig> = {}
): CalendarEvent[] {
  const cfg = { ...defaultConfig, ...config }
  const inflated: CalendarEvent[] = []
  const usedTitles = new Set<string>()

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + d)

    if (!cfg.workDays.includes(date.getDay())) continue

    const dayStart = new Date(date)
    dayStart.setHours(cfg.workHours.start, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(cfg.workHours.end, 0, 0, 0)

    const dayEvents = existingEvents
      .filter(e => {
        const eStart = new Date(e.start)
        return eStart.toDateString() === date.toDateString()
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime())

    const gaps = findGaps(dayEvents, dayStart, dayEnd, cfg.minGapToFill)

    const numToFill = Math.min(
      gaps.length,
      Math.ceil(gaps.length * cfg.intensity),
      cfg.maxBlocksPerDay
    )

    const shuffledGaps = gaps.sort(() => Math.random() - 0.5).slice(0, numToFill)

    for (const gap of shuffledGaps) {
      const duration = Math.min(gap.duration, randomChoice([30, 45, 60]))
      const start = new Date(gap.start)

      const end = new Date(start)
      end.setMinutes(end.getMinutes() + duration)

      const title = getUniqueTitle(usedTitles)

      inflated.push({
        id: `inflated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        originalTitle: title,
        start,
        end,
        source: 'inflated',
        color: SOURCE_COLORS.inflated,
        description: 'Auto-generated activity block',
      })
    }
  }

  return inflated
}

interface Gap {
  start: Date
  end: Date
  duration: number
}

function findGaps(
  events: CalendarEvent[],
  dayStart: Date,
  dayEnd: Date,
  minGap: number
): Gap[] {
  const gaps: Gap[] = []
  let currentTime = new Date(dayStart)

  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())

  for (const event of sorted) {
    const eventStart = new Date(event.start)
    if (eventStart > currentTime) {
      const gapDuration = (eventStart.getTime() - currentTime.getTime()) / (1000 * 60)
      if (gapDuration >= minGap) {
        gaps.push({
          start: new Date(currentTime),
          end: new Date(eventStart),
          duration: gapDuration,
        })
      }
    }
    const eventEnd = new Date(event.end)
    if (eventEnd > currentTime) {
      currentTime = eventEnd
    }
  }

  if (currentTime < dayEnd) {
    const gapDuration = (dayEnd.getTime() - currentTime.getTime()) / (1000 * 60)
    if (gapDuration >= minGap) {
      gaps.push({
        start: new Date(currentTime),
        end: new Date(dayEnd),
        duration: gapDuration,
      })
    }
  }

  return gaps
}

function getUniqueTitle(usedTitles: Set<string>): string {
  const available = INFLATED_TITLES.filter(t => !usedTitles.has(t))
  if (available.length === 0) {
    usedTitles.clear()
    return INFLATED_TITLES[0]
  }
  const title = available[Math.floor(Math.random() * available.length)]
  usedTitles.add(title)
  return title
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
