export interface Timezone {
  value: string
  label: string
  offset: number
  abbr: string
}

export const TIMEZONES: Timezone[] = [
  { value: 'America/Denver', label: 'Mountain Time (US)', offset: -6, abbr: 'MDT' },
  { value: 'America/Phoenix', label: 'Arizona (no DST)', offset: -7, abbr: 'MST' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)', offset: -7, abbr: 'PDT' },
  { value: 'America/Chicago', label: 'Central Time (US)', offset: -5, abbr: 'CDT' },
  { value: 'America/New_York', label: 'Eastern Time (US)', offset: -4, abbr: 'EDT' },
  { value: 'America/Anchorage', label: 'Alaska Time', offset: -8, abbr: 'AKDT' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time', offset: -10, abbr: 'HST' },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 1, abbr: 'BST' },
  { value: 'Europe/Paris', label: 'Central Europe (CET/CEST)', offset: 2, abbr: 'CEST' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 2, abbr: 'CEST' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 3, abbr: 'MSK' },
  { value: 'Asia/Dubai', label: 'Gulf (GST)', offset: 4, abbr: 'GST' },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: 5.5, abbr: 'IST' },
  { value: 'Asia/Shanghai', label: 'China (CST)', offset: 8, abbr: 'CST' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)', offset: 9, abbr: 'JST' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: 11, abbr: 'AEDT' },
  { value: 'Pacific/Auckland', label: 'New Zealand (NZST/NZDT)', offset: 13, abbr: 'NZDT' },
]

// Source timezone: all events are stored in Mountain Time
const SOURCE_OFFSET = -6

export function getOffsetDifference(targetTz: string): number {
  const tz = TIMEZONES.find(t => t.value === targetTz)
  if (!tz) return 0
  return tz.offset - SOURCE_OFFSET
}

export function convertHour(hour: number, minute: number, targetTz: string): { hour: number; minute: number } {
  const diff = getOffsetDifference(targetTz)
  let newHour = hour + Math.floor(diff)
  let newMinute = minute + (diff % 1) * 60

  if (newMinute >= 60) { newHour++; newMinute -= 60 }
  if (newMinute < 0) { newHour--; newMinute += 60 }
  while (newHour >= 24) newHour -= 24
  while (newHour < 0) newHour += 24

  return { hour: newHour, minute: newMinute }
}

export function formatTimeInTz(date: Date, targetTz: string, hour12: boolean = true): string {
  const hour = date.getHours()
  const minute = date.getMinutes()
  const { hour: h, minute: m } = convertHour(hour, minute, targetTz)

  if (hour12) {
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${displayHour}:${String(m).padStart(2, '0')} ${period}`
  }

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function getHourForPosition(date: Date, targetTz: string): number {
  const hour = date.getHours()
  const minute = date.getMinutes()
  const { hour: h } = convertHour(hour, minute, targetTz)
  return h + (minute + ((getOffsetDifference(targetTz) % 1) * 60)) / 60
}

export function getAbbr(targetTz: string): string {
  const tz = TIMEZONES.find(t => t.value === targetTz)
  return tz?.abbr || ''
}
