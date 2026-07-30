<template>
  <div class="min-h-screen relative">
    <router-view />

    <div
      class="admin-badge"
      @click="handleAdminBadge"
      title="Admin Access"
    ></div>

    <div
      v-if="showAdminLogin"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click.self="showAdminLogin = false"
    >
      <div class="glass-strong rounded-2xl p-8 w-full max-w-sm animate-fade-in">
        <h3 class="text-lg font-semibold mb-4 text-white/90">Admin Access</h3>
        <input
          v-model="adminPassword"
          type="password"
          placeholder="Enter password"
          class="glass-input w-full rounded-lg px-4 py-3 mb-4"
          @keyup.enter="authenticateAdmin"
        />
        <div class="flex gap-3">
          <button
            @click="showAdminLogin = false"
            class="glass-btn flex-1 rounded-lg px-4 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            @click="authenticateAdmin"
            class="glass-btn glass-btn-primary flex-1 rounded-lg px-4 py-2.5 text-sm"
          >
            Login
          </button>
        </div>
        <p v-if="authError" class="text-red-400 text-xs mt-3">{{ authError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCalendarStore } from '@/stores/calendar'

const store = useCalendarStore()
const showAdminLogin = ref(false)
const adminPassword = ref('')
const authError = ref('')

const ADMIN_PASSWORD = 'Ambrose2026!'

function handleAdminBadge() {
  if (store.isAdmin) {
    store.setAdmin(false)
    return
  }
  showAdminLogin.value = true
  adminPassword.value = ''
  authError.value = ''
}

function authenticateAdmin() {
  if (adminPassword.value === ADMIN_PASSWORD) {
    store.setAdmin(true)
    store.setAdminMode('edit')
    showAdminLogin.value = false
    authError.value = ''
  } else {
    authError.value = 'Invalid password'
  }
}
</script>
