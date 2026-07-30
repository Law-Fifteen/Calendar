<template>
  <div class="overflow-auto max-h-[calc(100vh-180px)]">
    <div class="grid grid-cols-[72px_1fr] min-w-[300px]">
      <div class="border-r border-white/5">
        <div class="h-10 border-b border-white/5"></div>
        <div
          v-for="hour in hours"
          :key="hour"
          class="h-16 flex items-start justify-end pr-3"
        >
          <span class="text-[10px] text-white/25 -mt-1.5">{{ formatHour(hour) }}</span>
        </div>
      </div>

      <div class="relative">
        <div
          class="h-10 flex items-center justify-center border-b border-white/5"
        >
          <span class="text-sm text-white/60">
            {{ dayLabel }}
          </span>
        </div>

        <div class="relative">
          <div
            v-for="hour in hours"
            :key="hour"
            :class="[
              'time-slot h-16 border-b border-white/[0.03]',
              canBook(hour) ? 'selectable' : ''
            ]"
            @click="handleTimeSlotClick(hour)"
          >
            <div
              v-if="isNow(hour)"
              class="absolute left-0 right-0 h-px bg-blue-500/50 z-10"
            >
              <div class="w-2 h-2 rounded-full bg-blue-500 -ml-1 -mt-1"></div>
            </div>
          </div>

          <div
            v-for="event in dayEvents"
            :key="event.id"
            class="event-block absolute left-2 right-2 z-20"
            :style="getEventStyle(event)"
            @click.stop="handleEventClick(event)"
            :title="event.title"
          >
            <div class="flex items-center gap-1.5">
              <div
                class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: event.color }"
              ></div>
              <span class="truncate text-white/90 text-[11px] font-medium">
                {{ event.title }}
              </span>
            </div>
            <div class="text-[9px] text-white/40 mt-0.5 ml-3">
              {{ formatEventTime(event) }}
            </div>
            <div v-if="event.description" class="text-[9px] text-white/30 mt-0.5 ml-3 truncate">
              {{ event.description }}
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

const store = useCalendarStore()

const hours = Array.from({ length: 13 }, (_, i) => i + 8)

const dayLabel = computed(() => {
  const today = new Date()
  const isToday = store.currentWeekStart.toDateString() === today.toDateString()
  return store.currentWeekStart.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }) + (isToday ? ' (Today)' : '')
})

const dayEvents = computed(() => {
  const dayStr = store.currentWeekStart.toDateString()
  return store.events
    .filter(e => new Date(e.start).toDateString() === dayStr)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
})

function formatHour(hour: number): string {
  if (hour === 0 || hour === 12) return hour === 0 ? '12 AM' : '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

function getEventStyle(event: CalendarEvent): Record<string, string> {
  const start = new Date(event.start)
  const end = new Date(event.end)

  const startHour = getHourForPosition(start, store.selectedTimezone)
  const endHour = getHourForPosition(end, store.selectedTimezone)

  const top = (startHour - 7) * 64
  const height = Math.max((endHour - startHour) * 64, 24)

  const opacity = event.source === 'inflated' ? '0.6' : '0.85'

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
  return `${formatTimeInTz(start, store.selectedTimezone)} - ${formatTimeInTz(end, store.selectedTimezone)}`
}

function isNow(hour: number): boolean {
  const now = new Date()
  const isToday = store.currentWeekStart.toDateString() === now.toDateString()
  return isToday && now.getHours() === hour
}

function canBook(hour: number): boolean {
  if (store.isAdmin) return false
  return !dayEvents.value.some(e => {
    const start = new Date(e.start)
    const end = new Date(e.end)
    const slotTime = new Date(store.currentWeekStart)
    slotTime.setHours(hour, 0, 0, 0)
    return slotTime >= start && slotTime < end
  })
}

function handleTimeSlotClick(hour: number) {
  if (store.isAdmin) return

  const start = new Date(store.currentWeekStart)
  start.setHours(hour, 0, 0, 0)
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + 30)

  store.selectedSlot = { start, end, duration: 30 }
  store.showBookingModal = true
}

function handleEventClick(event: CalendarEvent) {
  if (store.isAdmin && store.adminMode === 'edit') {
    const newTitle = prompt('Edit event title:', event.title)
    if (newTitle !== null && newTitle.trim()) {
      store.updateEventTitle(event.id, newTitle.trim())
    }
  }
}
</script>
