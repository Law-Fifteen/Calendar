<template>
  <div class="min-h-screen p-4 md:p-6 lg:p-8">
    <header class="mb-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Morgan Ambrose
          </h1>
          <span class="text-white/30 text-sm font-light">Calendar</span>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <div class="glass rounded-xl px-3 py-1.5 flex items-center gap-2">
            <button
              @click="store.viewMode === 'month' ? store.navigateMonth(-1) : store.navigateWeek(-1)"
              class="text-white/50 hover:text-white transition-colors p-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span class="text-sm text-white/70 min-w-[180px] text-center">
              {{ headerLabel }}
            </span>
            <button
              @click="store.viewMode === 'month' ? store.navigateMonth(1) : store.navigateWeek(1)"
              class="text-white/50 hover:text-white transition-colors p-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <button @click="store.goToToday" class="glass-btn rounded-lg px-3 py-1.5 text-xs">
            Today
          </button>

          <div class="glass rounded-xl p-1 flex">
            <button
              v-for="mode in (['week', 'day', 'month'] as const)"
              :key="mode"
              @click="store.setViewMode(mode)"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                store.viewMode === mode
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white/70'
              ]"
            >
              {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
            </button>
          </div>

          <select
            v-model="selectedTz"
            class="glass rounded-lg px-2 py-1.5 text-xs text-white/70 bg-transparent border-0 outline-none cursor-pointer appearance-none"
            title="Timezone"
          >
            <option v-for="tz in TIMEZONES" :key="tz.value" :value="tz.value" class="bg-gray-900 text-white">
              {{ tz.label }} ({{ tz.abbr }})
            </option>
          </select>

          <div v-if="store.isAdmin" class="flex items-center gap-2">
            <div
              v-for="source in ['google', 'calendly', 'proton']"
              :key="source"
              :class="[
                'w-2.5 h-2.5 rounded-full transition-all cursor-pointer',
                store.connectedCalendars.includes(source)
                  ? 'opacity-100'
                  : 'opacity-20'
              ]"
              :style="{ backgroundColor: SOURCE_COLORS[source as keyof typeof SOURCE_COLORS] }"
              :title="`${SOURCE_LABELS[source as keyof typeof SOURCE_LABELS]}: ${store.connectedCalendars.includes(source) ? 'Connected' : 'Not connected'}`"
              @click="store.showSettings = true"
            />
          </div>

          <button
            v-if="store.isAdmin"
            @click="store.showSettings = true"
            class="glass-btn rounded-lg p-2 text-white/50 hover:text-white"
            title="Settings"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="store.isAdmin" class="mt-3 flex items-center gap-2">
        <span class="text-xs text-purple-400/70 bg-purple-400/10 rounded-full px-2.5 py-0.5">Admin</span>
        <div class="glass rounded-lg p-0.5 flex">
          <button
            v-for="mode in (['view', 'edit', 'inflation'] as const)"
            :key="mode"
            @click="store.setAdminMode(mode)"
            :class="[
              'px-2.5 py-1 rounded-md text-xs transition-all',
              store.adminMode === mode
                ? 'bg-white/15 text-white'
                : 'text-white/40 hover:text-white/60'
            ]"
          >
            {{ mode === 'edit' ? 'Edit Names' : mode === 'inflation' ? 'Activity Inflation' : 'View' }}
          </button>
        </div>

        <div v-if="store.adminMode === 'inflation'" class="ml-3 flex items-center gap-2">
          <label class="text-xs text-white/40">Inflation:</label>
          <button
            @click="toggleInflation"
            :class="[
              'px-3 py-1 rounded-lg text-xs font-medium transition-all',
              store.inflationOn
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/5 text-white/40'
            ]"
          >
            {{ store.inflationOn ? 'ON' : 'OFF' }}
          </button>

          <template v-if="store.inflationOn">
            <label class="text-xs text-white/40 ml-2">Intensity:</label>
            <input
              :value="store.inflationIntensity"
              @input="store.setInflationIntensity(parseFloat(($event.target as HTMLInputElement).value))"
              type="range"
              min="0"
              max="1"
              step="0.1"
              class="w-20 accent-pink-500"
            />
            <span class="text-xs text-pink-400/70">{{ Math.round(store.inflationIntensity * 100) }}%</span>
            <button
              @click="applyInflation"
              class="glass-btn glass-btn-primary rounded-lg px-3 py-1 text-xs"
            >
              Regenerate
            </button>
          </template>
        </div>
      </div>
    </header>

    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <div class="glass-strong rounded-2xl px-8 py-6 flex items-center gap-4 animate-fade-in">
        <div class="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
        <span class="text-white/60 text-sm">Loading calendar data...</span>
      </div>
    </div>

    <div v-else-if="store.connectedCalendars.length === 0 && store.events.length === 0" class="flex items-center justify-center py-20">
      <div class="glass-strong rounded-2xl p-10 max-w-md text-center animate-fade-in">
        <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-white/90 mb-2">Connect Your Calendars</h2>
        <p class="text-sm text-white/40 mb-6">
          Link your Google Calendar, Calendly, and Proton Calendar to see everything in one place.
        </p>
        <button
          @click="store.showSettings = true"
          class="glass-btn glass-btn-primary rounded-xl px-6 py-2.5 text-sm font-medium"
        >
          Open Settings
        </button>
      </div>
    </div>

    <div v-else class="glass rounded-2xl overflow-hidden animate-fade-in">
      <WeekView v-if="store.viewMode === 'week'" />
      <DayView v-else-if="store.viewMode === 'day'" />
      <MonthView v-else-if="store.viewMode === 'month'" />
    </div>

    <BookingModal />
    <SettingsPanel />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { SOURCE_COLORS, SOURCE_LABELS } from '@/types'
import type { CalendarEvent } from '@/types'
import { fetchGoogleCalendarEvents } from '@/services/googleCalendar'
import { fetchCalendlyEvents } from '@/services/calendlyCalendar'
import { fetchProtonIcsEvents, loadProtonFromStorage, saveProtonToStorage } from '@/services/protonCalendar'
import protonEvents from '@/data/protonEvents.json'
import { generateInflatedEvents, generateRecurringEvents } from '@/services/activityInflation'
import WeekView from '@/components/WeekView.vue'
import DayView from '@/components/DayView.vue'
import MonthView from '@/components/MonthView.vue'
import BookingModal from '@/components/BookingModal.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import { TIMEZONES } from '@/services/timezone'

const store = useCalendarStore()
const selectedTz = ref(store.selectedTimezone)

const headerLabel = computed(() => {
  if (store.viewMode === 'month') {
    const d = new Date(store.currentWeekStart)
    d.setDate(1)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const start = new Date(store.currentWeekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startStr = start.toLocaleDateString('en-US', opts)
  const endStr = end.toLocaleDateString('en-US', opts)
  const year = start.getFullYear()

  return `${startStr} - ${endStr}, ${year}`
})

onMounted(async () => {
  // Auto-load Proton events from bundled data on first visit
  if (!localStorage.getItem('proton_ics_data') && protonEvents.length > 0) {
    const events: CalendarEvent[] = protonEvents.map((e: any) => ({
      ...e,
      source: 'proton' as const,
      start: new Date(e.start),
      end: new Date(e.end),
    }))
    saveProtonToStorage(events)
    store.setProtonConnected(true)
  }
  await loadAllCalendars()
})

watch(
  () => [store.googleToken, store.calendlyToken, store.config.protonIcsUrl],
  () => loadAllCalendars()
)

watch(selectedTz, (val) => {
  store.setSelectedTimezone(val)
})

async function loadAllCalendars() {
  store.loading = true
  store.clearEvents()

  const end = new Date(store.currentWeekStart)
  end.setDate(end.getDate() + 14)

  const promises: Promise<void>[] = []

  if (store.googleToken && store.config.googleClientId) {
    promises.push(
      fetchGoogleCalendarEvents(store.googleToken, store.config.googleApiKey, new Date(), end)
        .then(events => events.forEach(e => store.addEvent(e)))
        .catch(err => {
          if (err.message === 'GOOGLE_TOKEN_EXPIRED') {
            store.disconnectCalendar('google')
          }
          console.error('Google Calendar error:', err)
        })
    )
  }

  if (store.calendlyToken) {
    promises.push(
      fetchCalendlyEvents(store.calendlyToken, new Date(), end)
        .then(events => events.forEach(e => store.addEvent(e)))
        .catch(err => {
          if (err.message === 'CALENDLY_TOKEN_EXPIRED') {
            store.disconnectCalendar('calendly')
          }
          console.error('Calendly error:', err)
        })
    )
  }

  if (store.config.protonIcsUrl) {
    promises.push(
      fetchProtonIcsEvents(store.config.protonIcsUrl)
        .then(events => events.forEach(e => store.addEvent(e)))
        .catch(err => console.error('Proton ICS error:', err))
    )
  }

  // Load Proton from localStorage (ICS file upload)
  const protonStored = loadProtonFromStorage()
  if (protonStored.length > 0) {
    protonStored.forEach(e => {
      const evt = { ...e, start: new Date(e.start), end: new Date(e.end) }
      store.addEvent(evt)
    })
  }

  await Promise.allSettled(promises)

  // Apply persisted renames to all loaded events
  store.events = store.applyRenames(store.events)

  // Always add recurring events (standup + deep focus)
  const recurring = generateRecurringEvents(store.currentWeekStart, 14)
  recurring.forEach(e => store.addEvent(e))

  // Apply inflation if enabled
  if (store.inflationOn) {
    applyInflation()
  }

  store.loading = false
}

function applyInflation() {
  store.events
    .filter(e => e.source === 'inflated' && !e.id.startsWith('recurring-'))
    .forEach(e => store.removeEvent(e.id))

  const inflated = generateInflatedEvents(
    store.events.filter(e => e.source !== 'inflated'),
    store.currentWeekStart,
    14,
    { intensity: store.inflationIntensity }
  )
  inflated.forEach(e => store.addEvent(e))
}

function removeInflation() {
  store.events
    .filter(e => e.source === 'inflated' && !e.id.startsWith('recurring-'))
    .forEach(e => store.removeEvent(e.id))
}

function toggleInflation() {
  store.setInflationOn(!store.inflationOn)
  if (store.inflationOn) {
    applyInflation()
  } else {
    removeInflation()
  }
}
</script>
