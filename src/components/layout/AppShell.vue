<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store.js'
import HrNav from './HrNav.vue'
import WorkerNav from './WorkerNav.vue'

import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Drawer open/close state for mobile
const drawer = ref(false)

// Close the navigation drawer automatically when navigation occurs
watch(() => route.path, () => {
  drawer.value = false
})

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
      <template #prepend>
        <v-btn icon="mdi-menu" size="55" variant="text" @click="drawer = !drawer"></v-btn>
      </template>

      <v-app-bar-title class="font-weight-bold text-white text-center">
        <div>
          <v-avatar color="#F9ECEE" size="43" rounded="lg" class="mr-3">
            <v-icon color="#58111A" size="35">mdi-bag-checked</v-icon>
          </v-avatar>
          <span class="font-weight-bold">ARCH - LeaveDesk</span>
        </div>
      </v-app-bar-title>
    </v-app-bar>

    <!-- NAV-BAR FOR MOBILE -->
    <v-navigation-drawer
      v-if="mobile"
      v-model="drawer"
      temporary
      width="280"
      color="#58111A"
    >
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

