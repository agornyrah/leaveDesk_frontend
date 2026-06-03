<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import { useRequestsStore } from '../../stores/requests.store.js'
import { useAuthStore } from '../../stores/auth.store.js'
import { useWorkingDays } from '../../composables/useWorkingDays.js'
import { useSettingsStore } from '../../stores/settings.store.js'
import { useLeaveBalance } from '@/composables/useLeaveBalance.js'
import { LEAVE_TYPES } from '../../constants/leaveTypes.js'
import { storeToRefs } from 'pinia'

const router = useRouter()
const requestsStore = useRequestsStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const { calculateWorkingDays } = useWorkingDays()

const { allLeaveRequests } = storeToRefs(requestsStore)
const { calculateRemainingLeaves } = useLeaveBalance()
const selectedLeaveType = ref('Annual Leave')
const startDate = ref('')
const endDate = ref('')
const note = ref('')
const isLoading = ref(false)

const leaveTypes = LEAVE_TYPES.map(type => ({
  title: type.name,
  value: type.name,
}))

onMounted(async () => {
  await Promise.all([
    requestsStore.getAllRequests(),
    settingsStore.getSettings(),
  ])
})

const workingDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  return calculateWorkingDays(startDate.value, endDate.value)
})

const myApprovedRequests = computed(() =>
  allLeaveRequests.value.filter(req =>
    String(req.employeeId) === String(authStore.userInfo?.id) &&
    ['approved', 'on leave'].includes(req.status?.toLowerCase())
  )
)

const annualDaysRemaining = computed(() =>
  calculateRemainingLeaves(myApprovedRequests.value, 'Annual Leave')
)

const sickDaysRemaining = computed(() =>
  calculateRemainingLeaves(myApprovedRequests.value, 'Sick Leave')
)

const hasEnoughBalance = computed(() => {
  if (selectedLeaveType.value === 'Annual Leave')
    return workingDays.value <= annualDaysRemaining.value
  
  if (selectedLeaveType.value === 'Sick Leave') {
    return workingDays.value <= sickDaysRemaining.value
  }
  
  return true
})

// Dynamic form validation: blocks past dates
const minDateValue = computed(() => {
  return new Date().toISOString().split('T')[0]
})

async function onSubmit() {
  if (!startDate.value || !endDate.value) return

  isLoading.value = true

  try {
    const newRequest = {
      leaveType: selectedLeaveType.value,
      startDate: startDate.value,
      endDate: endDate.value,
      reason: note.value,
      days: workingDays.value,
      employeeId: authStore.userInfo?.id,
      employeeName: authStore.userInfo?.name,
      department: authStore.userInfo?.department,
      status: 'Pending',
      submittedAt: new Date().toISOString().split('T')[0],
    }

    await requestsStore.createRequest(newRequest)
    router.push('/my-requests')
  } catch {
    //Error
  } finally {
    isLoading.value = false
  }
}

function onCancel() {
  router.push('/dashboard')
}
</script>

<template>
  <AppShell>
    <div style="max-width: 1000px; margin: 0 auto; padding: 0 16px;">
      
      <!-- Header Area -->
      <v-row class="d-flex mb-2 align-center justify-space-between">
        <v-col cols="12" class="d-flex justify-start">
          <h1
            class="font-weight-bold text-display-medium"
            style="letter-spacing: 0.5px; color: #58111A !important;"
          >
            New Leave Request
          </h1>
        </v-col>
      </v-row>

      <!-- Form Card -->
      <v-card 
        class="pa-5 border-sm" 
        style="border-color: rgba(88, 17, 26, 0.12) !important;" 
        variant="flat" 
        color="white"
      >
        <!-- Leave type -->
        <div class="font-weight-bold mb-2 d-flex align-center" style="color: #58111A; letter-spacing: 0.5px; font-size: 1.6rem;">
          <v-icon class="mr-2" color="#58111A">mdi-logout-variant</v-icon>
          Leave Type
        </div>
        <v-row class="mb-10">
          <v-col
            v-for="type in leaveTypes"
            :key="type.value"
            cols="12"
            sm="6"
          >
            <!-- Card selector matching primary burgundy colors -->
            <v-card
              class="pa-3 rounded-lg"
              :style="{
                borderColor: selectedLeaveType === type.value ? '#58111A' : '#58111A',
                backgroundColor: selectedLeaveType === type.value ? '#F9ECEE' : 'white',
                borderWidth: selectedLeaveType === type.value ? '3px' : '1px',
                borderStyle: 'solid'
              }"
              variant="outlined"
              @click="selectedLeaveType = type.value"
            >
              <div class="d-flex align-center ga-2">
                <v-icon
                  :color="selectedLeaveType === type.value ? '#58111A' : 'black'"
                  size="25"
                >
                  {{ selectedLeaveType === type.value ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline' }}
                </v-icon>
                <span
                  class="font-weight-medium"
                  :style="{ color: selectedLeaveType === type.value ? '#58111A' : 'black' }"
                >
                  {{ type.title }}
                </span>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Date range selection -->
        <div class="font-weight-bold mb-2 d-flex align-center" style="color: #58111A; letter-spacing: 0.5px; font-size: 1.6rem;">
          <v-icon class="mr-2" color="#58111A">mdi-calendar-range</v-icon>
          Date Range
        </div>
        
        <v-row class="mb-10">
          <v-col cols="12" sm="6">
            <div class="font-weight-medium mb-2">Start date</div>
            <v-text-field
              v-model="startDate"
              type="date"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
              style="color: black;"
              :min="minDateValue"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <div class="font-weight-medium mb-2">End date</div>
            <v-text-field
              v-model="endDate"
              type="date"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
              style="color: black;"
              :min="startDate || minDateValue"
            />
          </v-col>
        </v-row>

        <!-- Working days info -->
        <v-card
          v-if="workingDays > 0"
          class="pa-4 rounded-lg mb-5 border-0"
          color="#F9ECEE"
          variant="flat"
        >
          <div class="d-flex flex-column align-center ga-4">
            <div class="text-center" style="min-width: 60px;">
              <div class="font-weight-bold" style="color: #58111A;">{{ workingDays }} Working Days</div>
              <div class="pt-1 text-center" style="color: #58111A; font-weight: 500;">
                Weekends automatically excluded & Public holidays not counted.
              </div>
            </div>
          </div>
        </v-card>

        <!-- Dynamic Balance Check -->
        <v-card
          v-if="selectedLeaveType === 'Annual Leave' && workingDays > 0"
          class="pa-4 rounded-lg mb-6"
          :color="hasEnoughBalance ? '#F0FDF4' : '#FEF2F2'"
          variant="flat"
        >
          <div class="d-flex align-center ga-2">
            <v-icon
              :color="hasEnoughBalance ? 'green-darken-2' : 'red-darken-2'"
              size="25"
            >
              {{ hasEnoughBalance ? 'mdi-checkbox-marked-circle' : 'mdi-alert-circle' }}
            </v-icon>
            <span
              class="font-weight-bold"
              :class="hasEnoughBalance ? 'text-green-darken-3' : 'text-red-darken-3'"
            >
              You have {{ annualDaysRemaining }} annual days remaining
              {{ hasEnoughBalance ? '— enough to cover this request.' : '— not enough for this request.' }}
            </span>
          </div>
        </v-card>
        <v-card
          v-if="selectedLeaveType === 'Sick Leave' && workingDays > 0"
          class="pa-4 rounded-lg mb-6"
          :color="hasEnoughBalance ? '#F0FDF4' : '#FEF2F2'"
          variant="flat"
        >
          <div class="d-flex align-center ga-2">
            <v-icon
              :color="hasEnoughBalance ? 'green-darken-2' : 'red-darken-2'"
              size="25"
            >
              {{ hasEnoughBalance ? 'mdi-checkbox-marked-circle' : 'mdi-alert-circle' }}
            </v-icon>
            <span
              class="font-weight-bold"
              :class="hasEnoughBalance ? 'text-green-darken-3' : 'text-red-darken-3'"
            >
              You have {{ sickDaysRemaining }} sick days remaining
              {{ hasEnoughBalance ? '— enough to cover this request.' : '— not enough for this request.' }}
            </span>
          </div>
        </v-card>

        <v-card
          v-if="selectedLeaveType === 'Unpaid Leave' && workingDays > 0"
          class="pa-4 rounded-lg mb-6"
          color="#FFFBEB"
          variant="flat"
        >
          <div class="d-flex align-center justify-center ga-2">
            <v-icon color="amber-darken-3" size="25">mdi-information-outline</v-icon>
            <span class="font-weight-bold text-amber-darken-4">
              This request will not deduct from your annual or sick leave balance.
            </span>
          </div>
        </v-card>

        <!-- Optional note -->
        <div class="font-weight-bold mb-2 d-flex align-center" style="color: #58111A; letter-spacing: 0.5px; font-size: 1.6rem;">
          <v-icon class="mr-2" color="#58111A">mdi-note-edit-outline</v-icon>
          Note <span class="ml-1" style="font-size: 1rem;"> (Optional) </span>
        </div>
        <v-textarea
          v-model="note"
          placeholder="e.g. Travelling for a family event."
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details
          rows="3"
          class="mb-6"
          style="color: black;"
        />

        <!-- Actions panel styled natively with solid and outline layouts -->
        <div class="d-flex flex-column flex-sm-row justify-end ga-3">
          <v-btn
            variant="outlined"
            rounded="lg"
            class="text-capitalize font-weight-bold px-6 order-2 order-sm-1"
            color="grey-darken-3"
            style="border-color: rgba(0,0,0,0.12);"
            block
            @click="onCancel"
          >
            Cancel
          </v-btn>
          <v-btn
            variant="flat"
            rounded="lg"
            height="50"
            color="#58111A"
            class="text-capitalize font-weight-bold px-6 order-1 order-sm-2"
            prepend-icon="mdi-checkbox-marked-circle-outline"
            :loading="isLoading"
            :disabled="!startDate || !endDate || workingDays === 0 || !hasEnoughBalance"
            block
            @click="onSubmit"
          >
            Submit Request
          </v-btn>
        </div>
      </v-card>
    </div>
  </AppShell>
</template>

<style scoped>

</style>