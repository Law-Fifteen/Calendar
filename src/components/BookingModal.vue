<template>
  <Teleport to="body">
    <div
      v-if="store.showBookingModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="close"
    >
      <div class="glass-strong rounded-2xl p-8 w-full max-w-md animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white/90">Request Meeting</h3>
          <button
            @click="close"
            class="text-white/30 hover:text-white/60 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="store.selectedSlot" class="mb-6">
          <div class="glass rounded-xl p-4">
            <div class="text-sm text-white/70 mb-1">{{ formatDate(store.selectedSlot.start) }}</div>
            <div class="text-sm text-white/50">
              {{ formatTime(store.selectedSlot.start) }} - {{ formatTime(store.selectedSlot.end) }}
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="text-xs text-white/40 mb-1.5 block">Duration</label>
          <div class="flex gap-2">
            <button
              v-for="dur in [15, 30, 45, 60]"
              :key="dur"
              @click="setDuration(dur)"
              :class="[
                'glass-btn rounded-lg px-3 py-2 text-sm flex-1 transition-all',
                selectedDuration === dur
                  ? 'glass-btn-primary text-white'
                  : 'text-white/50'
              ]"
            >
              {{ dur }}m
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="text-xs text-white/40 mb-1.5 block">Your Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="Full name"
            class="glass-input w-full rounded-lg px-4 py-2.5 text-sm"
          />
        </div>

        <div class="mb-4">
          <label class="text-xs text-white/40 mb-1.5 block">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@email.com"
            class="glass-input w-full rounded-lg px-4 py-2.5 text-sm"
          />
        </div>

        <div class="mb-6">
          <label class="text-xs text-white/40 mb-1.5 block">Notes (optional)</label>
          <textarea
            v-model="notes"
            rows="2"
            placeholder="What you'd like to discuss..."
            class="glass-input w-full rounded-lg px-4 py-2.5 text-sm resize-none"
          ></textarea>
        </div>

        <div class="flex gap-3">
          <button
            @click="close"
            class="glass-btn flex-1 rounded-xl px-4 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            @click="submit"
            :disabled="!isValid"
            :class="[
              'flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
              isValid
                ? 'glass-btn glass-btn-primary'
                : 'glass-btn opacity-40 cursor-not-allowed'
            ]"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { sendBookingEmail } from '@/services/bookingService'

const store = useCalendarStore()

const name = ref('')
const email = ref('')
const notes = ref('')
const selectedDuration = ref(30)

const isValid = computed(() => {
  return name.value.trim() && email.value.trim() && email.value.includes('@')
})

function setDuration(dur: number) {
  selectedDuration.value = dur
  if (store.selectedSlot) {
    const end = new Date(store.selectedSlot.start)
    end.setMinutes(end.getMinutes() + dur)
    store.selectedSlot = {
      ...store.selectedSlot,
      end,
      duration: dur,
    }
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function submit() {
  if (!isValid.value || !store.selectedSlot) return

  sendBookingEmail({
    name: name.value,
    email: email.value,
    date: store.selectedSlot.start,
    startTime: store.selectedSlot.start,
    endTime: store.selectedSlot.end,
    duration: selectedDuration.value,
    notes: notes.value || undefined,
  })

  close()
}

function close() {
  store.showBookingModal = false
  store.selectedSlot = null
  name.value = ''
  email.value = ''
  notes.value = ''
  selectedDuration.value = 30
}
</script>
