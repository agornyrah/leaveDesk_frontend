<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRequestsStore } from '../../stores/requests.store.js'
import { useLeaveBalance } from '../../composables/useLeaveBalance.js'
import { useWorkingDays } from '../../composables/useWorkingDays.js'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store.js'
import AppShell from '../../components/layout/AppShell.vue'
import { useSettingsStore } from '../../stores/settings.store.js'

const authStore = useAuthStore()
const router = useRouter()

const settingsStore = useSettingsStore()
const requestsStore = useRequestsStore()
const { allLeaveRequests } = storeToRefs(requestsStore)
const { calculateRemainingLeaves } = useLeaveBalance()
const { calculateWorkingDays } = useWorkingDays()

const firstName = computed(() => {
  const fullName = authStore.userInfo?.name || 'Eli'
  return fullName.split(' ')[0]
})

const myApprovedRequests = computed(() => {
  const userId = authStore.userInfo?.id

  return allLeaveRequests.value.filter(req =>
    String(req.employeeId) === String(userId) &&
    ['approved', 'on leave'].includes(req.status?.toLowerCase())
  )
})

const leaveBalances = computed(() => [
  {
    title: 'Annual leave',
    days: calculateRemainingLeaves(myApprovedRequests.value, 'Annual Leave'),
    label: 'days remaining',
  },
  {
    title: 'Sick leave',
    days: calculateRemainingLeaves(myApprovedRequests.value, 'Sick Leave'),
    label: 'days remaining',
  },
  {
    title: 'Paid Leave Used',
    days: myApprovedRequests.value
      .filter(req => ['Annual Leave', 'Sick Leave'].includes(req.leaveType))
      .reduce((total, req) => total + calculateWorkingDays(req.startDate, req.endDate), 0),
    label: 'days taken',
  },
])

function navigateToRequest() {
  router.push('/submit-request')
}

onMounted(() => {
  settingsStore.getSettings()
})

onMounted(async () => {
  await requestsStore.getAllRequests()
})
</script>

<template>
  <AppShell>
    <div style="max-width: 1000px; margin: 0 auto; padding: 0 16px;">
      <!-- Greeting Header -->
      <v-row class="d-flex mb-4 align-center justify-space-between">
        <v-col cols="12" sm="4" md="12" class="d-flex justify-start">
          <h1 class="font-weight-bold text-display-medium" style="letter-spacing: 0.5px; color: #58111A;">
            Welcome, {{ firstName }}
          </h1>
        </v-col>
      </v-row>

      <div>
        <!-- Stats Cards -->
        <v-row class="mb-6">
          <v-col
            v-for="(leave, i) in leaveBalances"
            :key="i"
            cols="12"
            sm="4"
          >
            <v-card
              class="pa-5"
              color="#58111A"
              variant="outlined"
            >
              <div class="font-weight-medium mb-1" style="font-size: 16px;">
                {{ leave.title }}
              </div>
              <div class="font-weight-bold" style="font-size: 40px;">
                {{ leave.days }} 
              <span class="font-weight-medium" style="font-size: 16px;">days</span>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="border-opacity-25 mb-6" />

        <!-- Request Leave Banner -->
        <v-card
          class="pa-5 d-flex align-center justify-space-between cursor-pointer"
          color="#58111A"
          variant="tonal"
          ripple
          @click="navigateToRequest"
        >
          <div class="d-flex align-center ga-3">
            <v-icon color="#58111A" size="45">mdi-calendar-plus</v-icon>
            <div>
              <div class="font-weight-bold" style="color: #58111A; font-size: 1.5rem;">
                Request leave 
              </div>
              <div class="font-weight-medium" style="color: #58111A;">
                Annual, Sick, or other leave types
              </div>
            </div>
          </div>
          <v-icon color="#58111A" size="40" class="mr-2">mdi-chevron-right</v-icon>
        </v-card>

        <v-divider class="border-opacity-25 my-6"></v-divider>
        
        <v-row>
          <v-col cols="12">
            <v-card elevation="0" rounded="lg">
              <v-card-title class="text-h6 pa-4">
                <v-icon class="mr-2">mdi-calendar</v-icon>
                Monitor Upcoming Holidays
              </v-card-title>

              <v-divider />

              <v-card-text class="pa-0">
              <div style="position: relative;">
                <iframe
                  src="https://calendar.google.com/calendar/embed?src=en.gh%23holiday%40group.v.calendar.google.com&ctz=Africa%2FAccra&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showNav=1"
                  width="100%"
                  height="600"
                  style="border: 0;"
                  frameborder="0"
                  scrolling="no"
                />
                <!-- Covers the footer -->
                <div style="
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  height: 50px;
                  background-color: white;
                "/>
              </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>

</style>

