<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="glass-strong rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-fade-in">
      <div v-if="loading">
        <div class="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-white/60 text-sm">Connecting Google Calendar...</p>
      </div>
      <div v-else-if="error">
        <p class="text-red-400 text-sm mb-4">{{ error }}</p>
        <button
          @click="$router.push('/')"
          class="glass-btn glass-btn-primary rounded-xl px-6 py-2 text-sm"
        >
          Back to Calendar
        </button>
      </div>
      <div v-else>
        <div class="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-white/70 text-sm mb-4">Google Calendar connected!</p>
        <button
          @click="$router.push('/')"
          class="glass-btn glass-btn-primary rounded-xl px-6 py-2 text-sm"
        >
          View Calendar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCalendarStore } from '@/stores/calendar'
import { parseGoogleCallback } from '@/services/googleCalendar'

const router = useRouter()
const store = useCalendarStore()

const loading = ref(true)
const error = ref('')

onMounted(() => {
  try {
    const token = parseGoogleCallback(window.location.hash)
    if (token) {
      store.setGoogleToken(token)
      loading.value = false
    } else {
      error.value = 'No token received'
      loading.value = false
    }
  } catch (e: any) {
    error.value = e.message || 'Authentication failed'
    loading.value = false
  }
})
</script>
