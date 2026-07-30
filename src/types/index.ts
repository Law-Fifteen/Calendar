export interface CalendarEvent {
  id: string
  title: string
  originalTitle?: string
  description?: string
  location?: string
  start: Date
  end: Date
  source: 'google' | 'calendly' | 'proton' | 'inflated'
  color: string
  allDay?: boolean
  editable?: boolean
  link?: string
}

export interface TimeSlot {
  start: Date
  end: Date
  duration: number
  available: boolean
}

export interface CalendarConfig {
  googleClientId: string
  googleApiKey: string
  calendlyClientId: string
  protonIcsUrl: string
  workHours: {
    start: number
    end: number
  }
  workDays: number[]
}

export interface BookingRequest {
  name: string
  email: string
  date: Date
  startTime: Date
  endTime: Date
  duration: number
  notes?: string
}

export type ViewMode = 'week' | 'day' | 'month'
export type AdminMode = 'view' | 'edit' | 'inflation'

export const SOURCE_COLORS: Record<CalendarEvent['source'], string> = {
  google: '#4285F4',
  calendly: '#006BFF',
  proton: '#646DFF',
  inflated: '#FF6B9D',
}

export const SOURCE_LABELS: Record<CalendarEvent['source'], string> = {
  google: 'Google Calendar',
  calendly: 'Calendly',
  proton: 'Proton Calendar',
  inflated: 'Blocked',
}

export const INFLATED_TITLES = [
  'Client Strategy Review',
  'Cross-Functional Sync',
  'Deep Focus Block',
  'Prep & Research',
  'Internal Review',
  'Strategy Session',
  'Team Alignment',
  'Executive Briefing',
  'Project Milestone Review',
  'Stakeholder Update',
  'Documentation Block',
  'Analysis Deep Dive',
  'Vendor Evaluation',
  'Budget Review',
  'Pipeline Review',
  'QBR Prep',
  'Training Session',
  'Onboarding Call',
  'Performance Review',
  'Workshop Facilitation',
]
