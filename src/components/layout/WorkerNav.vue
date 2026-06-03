<script setup>
// Presentation component for Worker Navigation list
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
        prepend-icon="mdi-view-dashboard-outline"
        title="Dashboard"
        value="dashboard"
        active-class="font-weight-bold"
        class="text-white rounded-lg mb-1"
        to="/dashboard"
      />
      <v-list-item
        prepend-icon="mdi-plus-box-outline"
        title="New request"
        value="new-request"
        active-class="font-weight-bold"
        class="text-white rounded-lg mb-1"
        to="/submit-request"
      />
      <v-list-item
        prepend-icon="mdi-folder-clock-outline"
        title="My requests"
        value="my-requests"
        active-class="font-weight-bold"
        class="text-white rounded-lg mb-1"
        to="/my-requests"
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
