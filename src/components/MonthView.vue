<template>
  <div class="p-4">
    <div class="grid grid-cols-7 gap-px mb-1">
      <div v-for="day in dayHeaders" :key="day" class="text-center text-xs font-medium text-white/40 py-2">
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-px">
      <div
        v-for="(cell, idx) in calendarCells"
        :key="idx"
        :class="[
          'min-h-[100px] p-1.5 rounded-lg border transition-all cursor-pointer',
          cell.isCurrentMonth
            ? 'border-white/5 hover:border-white/15'
            : 'border-transparent opacity-30',
          cell.isToday ? 'ring-1 ring-purple-400/50' : '',
        ]"
        @click="handleDayClick(cell.date)"
      >
        <div class="flex items-center justify-between mb-1">
          <span
            :class="[
              'text-xs font-medium',
              cell.isToday ? 'text-purple-400' : cell.isCurrentMonth ? 'text-white/60' : 'text-white/20',
            ]"
          >
            {{ cell.date.getDate() }}
          </span>
          <span v-if="cell.events.length > 0" class="text-[10px] text-white/30">
            {{ cell.events.length }}
          </span>
        </div>

        <div class="space-y-0.5">
          <div
            v-for="event in cell.events.slice(0, 3)"
            :key="event.id"
            :class="[
              'text-[10px] leading-tight px-1 py-0.5 rounded truncate',
              isPast(event) ? 'opacity-30' : '',
            ]"
            :style="{
              backgroundColor: `${event.color}${event.source === 'inflated' ? '20' : '30'}`,
              borderLeft: `2px solid ${event.color}${isPast(event) ? '40' : ''}`,
              color: 'rgba(255,255,255,0.8)',
            }"
            @click.stop="handleEventClick(event)"
          >
            {{ formatEventTimeShort(event) }} {{ event.title }}
          </div>
          <div v-if="cell.events.length > 3" class="text-[10px] text-white/30 px-1">
            +{{ cell.events.length - 3 }} more
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
import { formatTimeInTz, getHourForPosition } from '@/services/timezone'

const store = useCalendarStore()

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const calendarCells = computed(() => {
  const start = new Date(store.currentWeekStart)
  start.setDate(1)
  const firstDay = start.getDay()

  const cells: { date: Date; isCurrentMonth: boolean; isToday: boolean; events: CalendarEvent[] }[] = []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Previous month fill
  const prevMonthStart = new Date(start)
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
  const prevMonthDays = new Date(prevMonthStart.getFullYear(), prevMonthStart.getMonth() + 1, 0).getDate()

  for (let i = 0; i < firstDay; i++) {
    const d = new Date(prevMonthStart.getFullYear(), prevMonthStart.getMonth(), prevMonthDays - firstDay + i + 1)
    cells.push({ date: d, isCurrentMonth: false, isToday: d.toDateString() === today.toDateString(), events: [] })
  }

  // Current month
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), i)
    cells.push({ date: d, isCurrentMonth: true, isToday: d.toDateString() === today.toDateString(), events: [] })
  }

  // Next month fill
  const remaining = 42 - cells.length
  const nextMonth = new Date(start.getFullYear(), start.getMonth() + 1, 1)
  for (let i = 0; i < remaining; i++) {
    const d = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i + 1)
    cells.push({ date: d, isCurrentMonth: false, isToday: d.toDateString() === today.toDateString(), events: [] })
  }

  // Attach events
  store.events.forEach(event => {
    const eventDate = new Date(event.start).toDateString()
    const cell = cells.find(c => c.date.toDateString() === eventDate)
    if (cell) cell.events.push(event)
  })

  // Sort events by start time within each cell
  cells.forEach(cell => cell.events.sort((a, b) => a.start.getTime() - b.start.getTime()))

  return cells
})

function isPast(event: CalendarEvent): boolean {
  const now = new Date()
  const fortyFiveDaysAgo = new Date()
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45)
  return event.end < now && event.end > fortyFiveDaysAgo
}

function formatEventTimeShort(event: CalendarEvent): string {
  const start = new Date(event.start)
  return formatTimeInTz(start, store.selectedTimezone, false).replace(/^0/, '')
}

function handleDayClick(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const clicked = new Date(date)
  clicked.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((clicked.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (diffDays >= 0 ? 0 : -7))
  weekStart.setDate(weekStart.getDate() + Math.floor(diffDays / 7) * 7)

  store.currentWeekStart = weekStart
  store.setViewMode('day')
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
