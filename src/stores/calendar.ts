import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CalendarEvent, ViewMode, AdminMode, CalendarConfig } from '@/types'
import { SOURCE_COLORS } from '@/types'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<CalendarEvent[]>([])
  const viewMode = ref<ViewMode>('week')
  const currentWeekStart = ref<Date>(getWeekStart(new Date()))
  const adminMode = ref<AdminMode>('view')
  const isAdmin = ref(false)
  const showSettings = ref(false)
  const showBookingModal = ref(false)
  const selectedSlot = ref<{ start: Date; end: Date; duration: number } | null>(null)
  const loading = ref(false)
  const protonHasData = ref(!!localStorage.getItem('proton_ics_data'))
  const protonLastUpload = ref<string | null>(localStorage.getItem('proton_ics_date'))
  const selectedTimezone = ref<string>(localStorage.getItem('selected_timezone') || 'America/Denver')
  const eventRenames = ref<Record<string, string>>(JSON.parse(localStorage.getItem('event_renames') || '{}'))
  const inflationOn = ref(localStorage.getItem('inflation_on') !== 'false')
  const inflationIntensity = ref<number>(parseFloat(localStorage.getItem('inflation_intensity') || '0.7'))

  const config = ref<CalendarConfig>({
    googleClientId: localStorage.getItem('google_client_id') || '520576791479-ktrd53vmtmffnjc3vl858vcaidp8f628.apps.googleusercontent.com',
    googleApiKey: localStorage.getItem('google_api_key') || 'AIzaSyDfZ11Ip_i8Olw_RiySw3ceErLo-WiPhog',
    calendlyClientId: localStorage.getItem('calendly_client_id') || 'QMKY33Ac8ZqdKNBzTdD6-OG4cmakRnSB0AMg8VWsyQ',
    protonIcsUrl: localStorage.getItem('proton_ics_url') || '',
    workHours: { start: 9, end: 17 },
    workDays: [1, 2, 3, 4, 5],
  })

  const googleToken = ref<string | null>(localStorage.getItem('google_access_token'))
  const calendlyToken = ref<string | null>(localStorage.getItem('calendly_access_token'))

  const connectedCalendars = computed(() => {
    const connected: string[] = []
    if (googleToken.value) connected.push('google')
    if (calendlyToken.value) connected.push('calendly')
    if (config.value.protonIcsUrl || protonHasData.value) connected.push('proton')
    return connected
  })

  const todayEvents = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return events.value.filter(e => e.start >= today && e.start < tomorrow)
  })

  const weekEvents = computed(() => {
    const end = new Date(currentWeekStart.value)
    end.setDate(end.getDate() + 7)
    return events.value.filter(e => e.start >= currentWeekStart.value && e.start < end)
  })

  function getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
  }

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  function navigateWeek(direction: number) {
    const d = new Date(currentWeekStart.value)
    d.setDate(d.getDate() + (direction * 7))
    currentWeekStart.value = d
  }

  function navigateMonth(direction: number) {
    const d = new Date(currentWeekStart.value)
    d.setMonth(d.getMonth() + direction)
    currentWeekStart.value = d
  }

  function goToToday() {
    currentWeekStart.value = getWeekStart(new Date())
  }

  function addEvent(event: CalendarEvent) {
    events.value.push(event)
  }

  function removeEvent(id: string) {
    events.value = events.value.filter(e => e.id !== id)
  }

  function updateEventTitle(id: string, title: string) {
    const event = events.value.find(e => e.id === id)
    if (event) {
      if (!event.originalTitle) event.originalTitle = event.title
      event.title = title
      eventRenames.value[id] = title
      localStorage.setItem('event_renames', JSON.stringify(eventRenames.value))
    }
  }

  function applyRenames(eventList: CalendarEvent[]): CalendarEvent[] {
    return eventList.map(e => {
      const rename = eventRenames.value[e.id]
      if (rename) {
        if (!e.originalTitle) e.originalTitle = e.title
        e.title = rename
      }
      return e
    })
  }

  function setAdmin(authenticated: boolean) {
    isAdmin.value = authenticated
    if (!authenticated) adminMode.value = 'view'
  }

  function setAdminMode(mode: AdminMode) {
    adminMode.value = mode
  }

  function clearEvents() {
    events.value = []
  }

  function saveConfig() {
    localStorage.setItem('google_client_id', config.value.googleClientId)
    localStorage.setItem('google_api_key', config.value.googleApiKey)
    localStorage.setItem('calendly_client_id', config.value.calendlyClientId)
    localStorage.setItem('proton_ics_url', config.value.protonIcsUrl)
  }

  function setGoogleToken(token: string) {
    googleToken.value = token
    localStorage.setItem('google_access_token', token)
  }

  function setCalendlyToken(token: string) {
    calendlyToken.value = token
    localStorage.setItem('calendly_access_token', token)
  }

  function setProtonConnected(hasData: boolean) {
    protonHasData.value = hasData
    protonLastUpload.value = localStorage.getItem('proton_ics_date')
  }

  function setSelectedTimezone(tz: string) {
    selectedTimezone.value = tz
    localStorage.setItem('selected_timezone', tz)
  }

  function setInflationOn(on: boolean) {
    inflationOn.value = on
    localStorage.setItem('inflation_on', String(on))
  }

  function setInflationIntensity(val: number) {
    inflationIntensity.value = val
    localStorage.setItem('inflation_intensity', String(val))
  }

  function disconnectCalendar(source: string) {
    if (source === 'google') {
      googleToken.value = null
      localStorage.removeItem('google_access_token')
    } else if (source === 'calendly') {
      calendlyToken.value = null
      localStorage.removeItem('calendly_access_token')
    } else if (source === 'proton') {
      config.value.protonIcsUrl = ''
      protonHasData.value = false
      localStorage.removeItem('proton_ics_url')
      localStorage.removeItem('proton_ics_data')
      localStorage.removeItem('proton_ics_date')
    }
  }

  return {
    events,
    viewMode,
    currentWeekStart,
    adminMode,
    isAdmin,
    showSettings,
    showBookingModal,
    selectedSlot,
    loading,
    config,
    googleToken,
    calendlyToken,
    protonHasData,
    protonLastUpload,
    connectedCalendars,
    todayEvents,
    weekEvents,
    setViewMode,
    navigateWeek,
    navigateMonth,
    goToToday,
    addEvent,
    removeEvent,
    updateEventTitle,
    applyRenames,
    eventRenames,
    setAdmin,
    setAdminMode,
    clearEvents,
    saveConfig,
    setGoogleToken,
    setCalendlyToken,
    setProtonConnected,
    selectedTimezone,
    setSelectedTimezone,
    inflationOn,
    setInflationOn,
    inflationIntensity,
    setInflationIntensity,
    disconnectCalendar,
  }
})
