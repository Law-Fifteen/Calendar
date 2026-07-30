<template>
  <Teleport to="body">
    <div
      v-if="store.showSettings"
      class="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      @click.self="store.showSettings = false"
    >
      <div class="glass-strong w-full max-w-md h-full overflow-auto animate-slide-in-right">
        <div class="p-6">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-xl font-semibold text-white/90">Calendar Settings</h2>
            <button
              @click="store.showSettings = false"
              class="text-white/30 hover:text-white/60 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Google Calendar -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <div class="w-3 h-3 rounded-full bg-blue-400"></div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-white/80">Google Calendar</h3>
                <p class="text-xs text-white/35">OAuth2 authentication</p>
              </div>
              <span
                :class="[
                  'ml-auto text-xs px-2 py-0.5 rounded-full',
                  store.googleToken
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-white/5 text-white/30'
                ]"
              >
                {{ store.googleToken ? 'Connected' : 'Not connected' }}
              </span>
            </div>

            <div class="space-y-3">
              <div>
                <label class="text-xs text-white/40 mb-1 block">Client ID</label>
                <input
                  v-model="store.config.googleClientId"
                  type="text"
                  placeholder="xxxx.apps.googleusercontent.com"
                  class="glass-input w-full rounded-lg px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label class="text-xs text-white/40 mb-1 block">API Key</label>
                <input
                  v-model="store.config.googleApiKey"
                  type="text"
                  placeholder="AIza..."
                  class="glass-input w-full rounded-lg px-3 py-2 text-xs"
                />
              </div>
              <div class="flex gap-2">
                <button
                  v-if="!store.googleToken"
                  @click="connectGoogle"
                  class="glass-btn glass-btn-primary rounded-lg px-4 py-2 text-xs flex-1"
                >
                  Connect Google
                </button>
                <button
                  v-else
                  @click="store.disconnectCalendar('google')"
                  class="glass-btn rounded-lg px-4 py-2 text-xs text-red-400/70"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          <div class="border-t border-white/5 mb-8"></div>

          <!-- Calendly -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-white/80">Calendly</h3>
                <p class="text-xs text-white/35">OAuth2.1 + PKCE</p>
              </div>
              <span
                :class="[
                  'ml-auto text-xs px-2 py-0.5 rounded-full',
                  store.calendlyToken
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-white/5 text-white/30'
                ]"
              >
                {{ store.calendlyToken ? 'Connected' : 'Not connected' }}
              </span>
            </div>

            <div class="space-y-3">
              <div>
                <label class="text-xs text-white/40 mb-1 block">Client ID</label>
                <input
                  v-model="store.config.calendlyClientId"
                  type="text"
                  placeholder="Your Calendly Client ID"
                  class="glass-input w-full rounded-lg px-3 py-2 text-xs"
                />
              </div>
              <div class="flex gap-2">
                <button
                  v-if="!store.calendlyToken"
                  @click="connectCalendly"
                  class="glass-btn glass-btn-primary rounded-lg px-4 py-2 text-xs flex-1"
                >
                  Connect Calendly
                </button>
                <button
                  v-else
                  @click="store.disconnectCalendar('calendly')"
                  class="glass-btn rounded-lg px-4 py-2 text-xs text-red-400/70"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          <div class="border-t border-white/5 mb-8"></div>

          <!-- Proton Calendar -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <div class="w-3 h-3 rounded-full bg-purple-400"></div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-white/80">Proton Calendar</h3>
                <p class="text-xs text-white/35">ICS file upload (free)</p>
              </div>
              <span
                :class="[
                  'ml-auto text-xs px-2 py-0.5 rounded-full',
                  store.protonHasData
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-white/5 text-white/30'
                ]"
              >
                {{ store.protonHasData ? 'Loaded' : 'No data' }}
              </span>
            </div>

            <div class="space-y-3">
              <div v-if="store.protonLastUpload" class="text-xs text-white/30">
                Last upload: {{ formatUploadDate(store.protonLastUpload) }}
              </div>

              <div
                class="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-purple-400/30 transition-colors cursor-pointer"
                @click="triggerFileInput"
                @dragover.prevent="dragOver = true"
                @dragleave="dragOver = false"
                @drop.prevent="handleDrop"
                :class="{ 'border-purple-400/40 bg-purple-400/5': dragOver }"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept=".ics"
                  class="hidden"
                  @change="handleFileSelect"
                />
                <svg class="w-8 h-8 mx-auto mb-2 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-xs text-white/40 mb-1">
                  {{ dragOver ? 'Drop .ics file here' : 'Drag & drop .ics file' }}
                </p>
                <p class="text-[10px] text-white/25">
                  Export from Proton Calendar Settings
                </p>
              </div>

              <div v-if="store.protonHasData" class="flex gap-2">
                <button
                  @click="store.disconnectCalendar('proton')"
                  class="glass-btn rounded-lg px-4 py-2 text-xs text-red-400/70"
                >
                  Clear Data
                </button>
              </div>

              <div class="glass rounded-lg p-3">
                <p class="text-[11px] text-white/35 leading-relaxed">
                  <strong class="text-white/50">How to export:</strong><br>
                  1. Open calendar.proton.me<br>
                  2. Settings → Calendars<br>
                  3. Click your calendar → Export<br>
                  4. Upload the .ics file above
                </p>
              </div>
            </div>
          </div>

          <div class="border-t border-white/5 mb-8"></div>

          <!-- Connected Sources -->
          <div class="mb-6">
            <h3 class="text-xs text-white/40 mb-3 uppercase tracking-wider">Active Sources</h3>
            <div class="flex gap-2 flex-wrap">
              <div
                v-for="source in ['google', 'calendly', 'proton']"
                :key="source"
                :class="[
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs',
                  store.connectedCalendars.includes(source)
                    ? 'bg-white/10 text-white/70'
                    : 'bg-white/5 text-white/25'
                ]"
              >
                <div
                  class="w-2 h-2 rounded-full"
                  :style="{ backgroundColor: SOURCE_COLORS[source as keyof typeof SOURCE_COLORS] }"
                ></div>
                {{ SOURCE_LABELS[source as keyof typeof SOURCE_LABELS] }}
              </div>
            </div>
          </div>

          <button
            @click="save"
            class="glass-btn glass-btn-primary w-full rounded-xl py-3 text-sm font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { SOURCE_COLORS, SOURCE_LABELS } from '@/types'
import { parseProtonIcsFile, saveProtonToStorage, loadProtonFromStorage } from '@/services/protonCalendar'
import { getCalendlyAuthUrl, generateCalendlyCodeVerifier, generateCalendlyCodeChallenge } from '@/services/calendlyCalendar'
import { getGoogleAuthUrl } from '@/services/googleCalendar'

const store = useCalendarStore()
const fileInput = ref<HTMLInputElement>()
const dragOver = ref(false)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processFile(file)
}

function handleDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  if (!file.name.endsWith('.ics')) {
    alert('Please upload an .ics file')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    const events = parseProtonIcsFile(content)
    saveProtonToStorage(events)
    store.setProtonConnected(true)
    store.clearEvents()
    events.forEach(ev => store.addEvent(ev))
  }
  reader.readAsText(file)
}

function connectGoogle() {
  if (!store.config.googleClientId) {
    alert('Enter your Google Client ID first')
    return
  }
  store.saveConfig()
  const redirectUri = `${window.location.origin}/google-callback`
  const url = getGoogleAuthUrl(store.config.googleClientId, redirectUri)
  window.location.href = url
}

async function connectCalendly() {
  if (!store.config.calendlyClientId) {
    alert('Enter your Calendly Client ID first')
    return
  }
  store.saveConfig()

  const verifier = generateCalendlyCodeVerifier()
  localStorage.setItem('calendly_pkce_verifier', verifier)
  const challenge = await generateCalendlyCodeChallenge(verifier)

  const redirectUri = `${window.location.origin}/calendly-callback`
  const url = getCalendlyAuthUrl(store.config.calendlyClientId, redirectUri, challenge)
  window.location.href = url
}

function formatUploadDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function save() {
  store.saveConfig()
  store.showSettings = false
}
</script>

<style scoped>
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
</style>
