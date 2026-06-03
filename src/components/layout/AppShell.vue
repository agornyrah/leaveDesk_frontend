<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store.js'
import HrNav from './HrNav.vue'
import WorkerNav from './WorkerNav.vue'

import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

const authStore = useAuthStore()
const router = useRouter()

// Read the role directly from the store, with path-based fallback for testing
const role = computed(() => {
  if (authStore.isAuthenticated && authStore.userInfo?.role) {
    return authStore.userInfo.role
  }
  // Fallback: Infer role based on current route path
  const path = router.currentRoute.value.path
  if (path.includes('staff') || path.includes('leave-requests') || path.includes('/hr/') || path.includes('employee-profile')) {
    return 'hr'
  }
  return 'worker'
})

function logout() {
  authStore.logout()
  router.push({ path: '/' })
}

</script>

<template>
  <v-row class="fill-height">

    <!-- NAV-BAR FOR TABLET AND DESKTOP -->
    <v-navigation-drawer   
      v-if="!mobile"      
      expand-on-hover
      permanent
      rail
      width="280" 
      color="#58111A">

      <v-list>
          <v-list-item>
            <template #prepend>
              <v-avatar color="#F9ECEE" size="25" rounded="lg">
                <v-icon color="#58111A" size="20">mdi-bag-checked</v-icon>
              </v-avatar>
            </template>
            <span class="font-weight-bold">ARCH LeaveDesk</span>
          </v-list-item>
      </v-list>

      <v-divider class="border-opacity-25" color="white"/>

      <!-- Role-based nav -->
      <HrNav v-if="role === 'hr'" />
      <WorkerNav v-else-if = "role === 'worker'" />
    </v-navigation-drawer>

    <!-- NAV-BAR FOR MOBILE -->
    <v-app-bar v-if="mobile" color="#58111A" flat height="80">
      <v-app-bar-title class="font-weight-bold text-white text-center">
        <div>
          <v-avatar color="#F9ECEE" size="43" rounded="lg" class="mr-3">
            <v-icon color="#58111A" size="35">mdi-bag-checked</v-icon>
          </v-avatar>
          <span class="font-weight-bold">ARCH - LeaveDesk</span>
        </div>
      </v-app-bar-title>

      <template #prepend>
        <template v-if="role === 'hr'">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-menu" size="55" variant="text" v-bind="props"></v-btn>
            </template>

            <v-list class="pa-5">
              <v-btn rounded="xl" to="/staff-overview" color="#58111A" class="mr-2">
                <v-tooltip activator="parent" location="bottom">Staff Overview</v-tooltip>
                <v-icon icon="mdi-account-group-outline" size="25"></v-icon>
              </v-btn>
              <v-btn rounded="xl" to="/leave-requests" color="#58111A" class="mr-2">
                <v-tooltip activator="parent" location="bottom">Leave Requests</v-tooltip>
                <v-icon icon="mdi-clipboard-text-clock-outline" size="25"></v-icon>
              </v-btn>

              <v-btn rounded="xl" to="/hr/settings" color="#58111A" class="mr-2">
                <v-tooltip activator="parent" location="bottom">Settings</v-tooltip>
                <v-icon icon="mdi-cog-outline" size="25"></v-icon>
              </v-btn>

              <v-btn rounded="xl" color="#58111A" @click="logout">
                <v-tooltip activator="parent" location="bottom">Logout </v-tooltip>
                <v-icon icon="mdi-logout" size="25"></v-icon>
              </v-btn>
            </v-list>
          </v-menu>
        </template>

        <template v-else-if="role === 'worker'">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-menu" size="55" variant="text" v-bind="props"></v-btn>
            </template>

            <v-list class="pa-5">
              <v-btn rounded="xl" to="/dashboard" color="#58111A" class="mr-2">
                <v-tooltip activator="parent" location="bottom">Dashboard</v-tooltip>
                <v-icon icon="mdi-view-dashboard-outline" size="25"></v-icon>
              </v-btn>
              <v-btn rounded="xl" to="/submit-request" color="#58111A" class="mr-2">
                <v-tooltip activator="parent" location="bottom">Submit Request</v-tooltip>
                <v-icon icon="mdi-plus-box-outline" size="25"></v-icon>
              </v-btn>

              <v-btn rounded="xl" to="/my-requests" color="#58111A" class="mr-2">
                <v-tooltip activator="parent" location="bottom">My Requests</v-tooltip>
                <v-icon icon="mdi-folder-clock-outline" size="25"></v-icon>
              </v-btn>

              <v-btn rounded="xl" color="#58111A" @click="logout">
                <v-tooltip activator="parent" location="bottom">Logout </v-tooltip>
                <v-icon icon="mdi-logout" size="25"></v-icon>
              </v-btn>
            </v-list>
          </v-menu>
        </template>
      </template>
    </v-app-bar>

    <!-- Page content renders here -->
    <v-main color="#white" style="min-height: 100vh;">
      <div class="pa-2">
        <slot>
          <!-- <RouterView /> -->
        </slot>
      </div>
    </v-main>

  </v-row>
</template>

<style scoped>

</style>

