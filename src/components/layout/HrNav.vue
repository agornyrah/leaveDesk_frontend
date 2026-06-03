<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store.js'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push({ path: '/' })
}
</script>

<template>
  <div>
    <v-list nav density="compact" class="bg-transparent">
      <v-list-item
        prepend-icon="mdi-account-group-outline color-white"
        title="All Staff"
        value="staff"
        active-class="font-weight-bold"
        class="text-white rounded-lg mb-1"
        to="/staff-overview"
      />
      <v-list-item
        prepend-icon="mdi-clipboard-text-clock-outline"
        title="Requests"
        value="requests"
        active-class="font-weight-bold"
        class="text-white rounded-lg mb-1"
        to="/leave-requests"
      />
      <v-list-item
        prepend-icon="mdi-cog-outline"
        title="Settings"
        value="settings"
        active-class="font-weight-bold"
        class="text-white rounded-lg mb-1"
        to="/hr/settings"
      />
      <v-list-item
        prepend-icon="mdi-logout"
        title="Sign out"
        value="signout"
        active-class="font-weight-bold"
        class="text-white rounded-lg mb-1"
        @click="logout"
      />
    </v-list>
  </div>
</template>
