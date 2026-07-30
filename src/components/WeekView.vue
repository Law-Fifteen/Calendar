<template>
  <div class="overflow-auto max-h-[calc(100vh-180px)]">
    <div class="grid grid-cols-8 min-w-[700px]">
      <div class="border-r border-white/5 p-2">
        <div class="h-10"></div>
        <div
          v-for="hour in hours"
          :key="hour"
          class="h-16 flex items-start justify-end pr-2"
        >
          <span class="text-[10px] text-white/25 -mt-1.5">{{ formatHour(hour) }}</span>
        </div>
      </div>

      <div
        v-for="(day, index) in weekDays"
        :key="day.toISOString()"
        :class="[
          'border-r border-white/5 last:border-r-0',
          isToday(day) ? 'bg-white/[0.02]' : ''
        ]"
      >
        <div
          :class="[
            'h-10 flex flex-col items-center justify-center border-b border-white/5',
            isToday(day) ? 'text-blue-400' : 'text-white/50'
          ]"
        >
          <span class="text-[10px] uppercase tracking-wider">{{ dayNames[day.getDay()] }}</span>
          <span
            :class="[
              'text-lg font-semibold',
              isToday(day) ? 'bg-blue-500/20 w-8 h-8 rounded-full flex items-center justify-center' : ''
            ]"
          >
            {{ day.getDate() }}
          </span>
        </div>

        <div class="relative">
          <div
            v-for="hour in hours"
            :key="hour"
            :class="[
              'time-slot h-16 border-b border-white/[0.03]',
              canBook(day, hour) ? 'selectable' : ''
            ]"
            @click="handleTimeSlotClick(day, hour)"
          >
            <div
              v-if="isNow(day, hour)"
              class="absolute left-0 right-0 h-px bg-blue-500/50 z-10"
              :style="{ top: '0px' }"
            >
              <div class="w-2 h-2 rounded-full bg-blue-500 -ml-1 -mt-1"></div>
            </div>
          </div>

          <div
            v-for="event in getEventsForDay(day)"
            :key="event.id"
            class="event-block absolute left-1 right-1 z-20"
            :style="getEventStyle(event, day)"
            @click.stop="handleEventClick(event)"
            :title="event.title"
          >
            <div class="flex items-center gap-1">
              <div
                class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: event.color }"
              ></div>
              <span class="truncate text-white/90 text-[11px]">
                {{ event.title }}
              </span>
            </div>
            <div class="text-[9px] text-white/40 mt-0.5">
              {{ formatEventTime(event) }}
            </div>

            <div
              v-if="store.isAdmin && store.adminMode === 'edit'"
              class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 hover:opacity-100"
              @click.stop="startEditTitle(event)"
            >
              <svg class="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import type { CalendarEvent } from '@/types'
import { convertHour, formatTimeInTz, getHourForPosition, getAbbr } from '@/services/timezone'

const store = useCalendarStore()

const hours = Array.from({ length: 13 }, (_, i) => i + 8)
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const weekDays = computed(() => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(store.currentWeekStart)
    day.setDate(day.getDate() + i)
    days.push(day)
  }
  return days
})

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 12) return hour === 0 ? '12 AM' : '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

function getEventsForDay(day: Date): CalendarEvent[] {
  const dayStr = day.toDateString()
  return store.events.filter(e => {
    const eventDay = new Date(e.start).toDateString()
    return eventDay === dayStr
  })
}

function isPast(event: CalendarEvent): boolean {
  const now = new Date()
  const fortyFiveDaysAgo = new Date()
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45)
  return event.end < now && event.end > fortyFiveDaysAgo
}

function getEventStyle(event: CalendarEvent, day: Date): Record<string, string> {
  const start = new Date(event.start)
  const end = new Date(event.end)

  const startHour = getHourForPosition(start, store.selectedTimezone)
  const endHour = getHourForPosition(end, store.selectedTimezone)

  const top = (startHour - 8) * 64
  const height = Math.max((endHour - startHour) * 64, 24)

  const opacity = event.source === 'inflated' ? '0.6' : isPast(event) ? '0.3' : '0.85'

  return {
    top: `${top}px`,
    height: `${height}px`,
    backgroundColor: `${event.color}${event.source === 'inflated' ? '30' : '40'}`,
    borderLeft: `3px solid ${event.color}`,
    opacity,
  }
}

function formatEventTime(event: CalendarEvent): string {
  const start = new Date(event.start)
  const end = new Date(event.end)
  return `${formatTimeInTz(start, store.selectedTimezone, false)} - ${formatTimeInTz(end, store.selectedTimezone, false)}`
}

function isNow(day: Date, hour: number): boolean {
  const now = new Date()
  return isToday(day) && now.getHours() === hour
}

function canBook(day: Date, hour: number): boolean {
  if (store.isAdmin) return false
  const dayEvents = getEventsForDay(day)
  return !dayEvents.some(e => {
    const start = new Date(e.start)
    const end = new Date(e.end)
    const slotTime = new Date(day)
    slotTime.setHours(hour, 0, 0, 0)
    return slotTime >= start && slotTime < end
  })
}

function handleTimeSlotClick(day: Date, hour: number) {
  if (store.isAdmin) return

  const start = new Date(day)
  start.setHours(hour, 0, 0, 0)
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + 30)

  store.selectedSlot = { start, end, duration: 30 }
  store.showBookingModal = true
}

function handleEventClick(event: CalendarEvent) {
  if (store.isAdmin && store.adminMode === 'edit') {
    startEditTitle(event)
  }
}

function startEditTitle(event: CalendarEvent) {
  const newTitle = prompt('Edit event title:', event.title)
  if (newTitle !== null && newTitle.trim()) {
    store.updateEventTitle(event.id, newTitle.trim())
  }
}
</script>
