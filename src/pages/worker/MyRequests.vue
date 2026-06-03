<script setup>
import { ref, computed, onMounted } from 'vue'
// import StatusChip from '@/components/leave/StatusChip.vue'
import RequestStatusChip from '@/components/leave/RequestStatusChip.vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import EmptyState from '../../components/shared/EmptyState.vue'
import ConfirmDialog from '../../components/shared/ConfirmDialog.vue'
import { useRequestsStore } from '../../stores/requests.store.js'
import { useAuthStore } from '../../stores/auth.store.js'
import { useWorkingDays } from '../../composables/useWorkingDays.js'
import { storeToRefs } from 'pinia'

const router = useRouter()
const requestsStore = useRequestsStore()
const authStore = useAuthStore()
const { allLeaveRequests, isLoading } = storeToRefs(requestsStore)
const { calculateWorkingDays, formatDate } = useWorkingDays()

// Active tab: 'pending' | 'approved' | 'rejected' | 'all'
const activeTab = ref('pending')

// Confirm cancel dialog state
const confirmDialog = ref(false)
const selectedRequest = ref(null)
const deleteLoading = ref(false)

// Mock data for when API is not connected
const mockRequests = ref([
  {
    id: 1,
    leaveType: 'Annual Leave',
    status: 'Pending',
    startDate: '2025-06-10',
    endDate: '2025-06-17',
    reason: 'Travelling for a family event. Will be reachable by email if urgent.',
    submittedAt: '2025-05-28',
  },
  {
    id: 2,
    leaveType: 'Sick Leave',
    status: 'Approved',
    startDate: '2025-03-03',
    endDate: '2025-03-04',
    reason: '',
    submittedAt: '2025-03-03',
  },
  {
    id: 3,
    leaveType: 'Annual Leave',
    status: 'Rejected',
    startDate: '2025-01-15',
    endDate: '2025-01-17',
    reason: '',
    submittedAt: '2025-01-08',
  },
])

// Filter to current user's requests if store has data
const myRequests = computed(() => {
  const userId = authStore.userInfo?.id
  const storeRequests = allLeaveRequests.value
  if (storeRequests.length > 0 && userId) {
    return storeRequests.filter((r) => r.employeeId === userId)
  }
  return mockRequests.value
})

// Tabs with counts — same pattern as LeaveRequests.vue
const tabs = computed(() => [
  { key: 'pending', label: 'Pending', count: myRequests.value.filter((r) => r.status?.toLowerCase() === 'pending').length },
  { key: 'approved', label: 'Approved', count: myRequests.value.filter((r) => r.status?.toLowerCase() === 'approved' || r.status?.toLowerCase() === 'on leave').length },
  { key: 'rejected', label: 'Rejected', count: myRequests.value.filter((r) => r.status?.toLowerCase() === 'rejected').length },
  { key: 'all', label: 'All', count: myRequests.value.length },
])

const filteredRequests = computed(() => {
  if (activeTab.value === 'all') return myRequests.value
  if (activeTab.value === 'approved') {
    return myRequests.value.filter((r) =>
      r.status?.toLowerCase() === 'approved' || r.status?.toLowerCase() === 'on leave'
    )
  }
  return myRequests.value.filter((r) => r.status?.toLowerCase() === activeTab.value)
})

function onCancelRequest(request) {
  selectedRequest.value = request
  confirmDialog.value = true
}

async function onConfirmCancel() {
  if (!selectedRequest.value) return
  deleteLoading.value = true

  try {
    await requestsStore.deleteRequest(selectedRequest.value.id)
  } catch {
    // Fallback: remove from mock data
    const idx = mockRequests.value.findIndex((r) => r.id === selectedRequest.value.id)
    if (idx !== -1) mockRequests.value.splice(idx, 1)
  } finally {
    deleteLoading.value = false
    confirmDialog.value = false
    selectedRequest.value = null
  }
}

onMounted(async () => {
  try {
    await requestsStore.getAllRequests()
  } catch {
    // silently fall back to mock data
  }
})
</script>

<template>
  <AppShell>
    <div style="max-width: 1000px; margin: 0 auto; padding: 0 16px;">

      <!-- Header Area — same structure as LeaveRequests.vue -->
      <v-row class="d-flex mb-2 align-center justify-space-between">
        <v-col cols="12" sm="8" class="d-flex justify-start">
          <h1
            class="font-weight-bold text-display-medium"
            style="letter-spacing: 0.5px; color: #58111A !important;"
          >
            My Requests
          </h1>
        </v-col>
        <v-col cols="12" sm="4" class="d-flex justify-md-end">
          <v-btn
            prepend-icon="mdi-plus"
            class="font-weight-bold px-4"
            variant="tonal"
            color="#58111A"
            @click="router.push('/submit-request')"
          >
            New Request
          </v-btn>
        </v-col>
      </v-row>

      <!-- Status Tabs — exact same pattern as LeaveRequests.vue -->
      <div class="d-flex ga-2 mb-6 flex-wrap" style="overflow-x: auto;">
        <v-btn
          v-for="tab in tabs"
          :key="tab.key"
          class="px-4 rounded-lg font-weight-bold"
          :variant="activeTab === tab.key ? 'flat' : 'outlined'"
          :color="activeTab === tab.key ? '#58111A' : '#58111A'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span
            v-if="tab.count > 0"
            class="tab-count ml-2"
            :class="{ 'tab-count--active': activeTab === tab.key }"
          >
            {{ tab.count }}
          </span>
        </v-btn>
      </div>

      <!-- Loading skeleton — same as LeaveRequests.vue -->
      <div v-if="isLoading">
        <v-skeleton-loader
          v-for="i in 3"
          :key="i"
          type="card"
          class="mb-4 rounded-xl"
        />
      </div>

      <!-- Request cards — same dark burgundy card design as RequestCard.vue -->
      <template v-else>
        <v-card
          v-for="request in filteredRequests"
          :key="request.id"
          class="pa-5 mb-4"
          variant="flat"
          color="#58111A"
        >
          <!-- Header row: leave type title + chips -->
          <div class="d-flex align-start justify-space-between mb-4">
            <div>
              <div class="font-weight-bold" style="font-size: 1.6rem;">
                {{ request.leaveType }}
              </div>
              <div class="font-weight-medium">
                Submitted: {{ formatDate(request.submittedAt) }}
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <RequestStatusChip :status="request.status" />
            </div>
          </div>

          <!-- Date + working days row — same icons and layout as RequestCard.vue -->
          <div class="d-flex align-center ga-6 mb-3 flex-wrap">
            <div class="d-flex align-center ga-2">
              <v-icon size="16" color="white">mdi-calendar-range-outline</v-icon>
              <span>{{ formatDate(request.startDate) }} – {{ formatDate(request.endDate) }}</span>
            </div>
            <div class="d-flex align-center ga-2">
              <v-icon size="16" color="white">mdi-clock-outline</v-icon>
              <span>
                {{ calculateWorkingDays(request.startDate, request.endDate) }} working
                {{ calculateWorkingDays(request.startDate, request.endDate) === 1 ? 'day' : 'days' }}
              </span>
            </div>
          </div>

          <!-- Reason note — same white box style as RequestCard.vue -->
          <div
            v-if="request.reason"
            class="py-3 px-5 mb-4 rounded-lg font-weight-medium"
            style="background-color: white; color: #58111A;"
          >
            {{ request.reason }}
          </div>

          <!-- Cancel action — only for pending requests, worker's only right -->
          <div v-if="request.status?.toLowerCase() === 'pending'" class="d-flex ga-4 mb-1">
            <v-btn
              variant="flat"
              rounded="lg"
              class="text-capitalize font-weight-medium"
              style="background-color: white; color: #58111A;"
              prepend-icon="mdi-close-circle-outline"
              @click="onCancelRequest(request)"
            >
              Cancel Request
            </v-btn>
          </div>
        </v-card>

        <!-- Empty state — same component as LeaveRequests.vue -->
        <EmptyState
          v-if="filteredRequests.length === 0"
          icon="mdi-clipboard-check-outline"
          :title="activeTab === 'pending' ? 'No pending requests' : 'No requests found'"
          :subtitle="activeTab === 'pending' ? 'You have no pending leave requests at the moment.' : 'There are no requests in this category yet.'"
        />
      </template>
    </div>

    <!-- Confirm cancel dialog -->
    <ConfirmDialog
      v-model="confirmDialog"
      title="Cancel Request?"
      icon="mdi-calendar-remove"
      :message="`Cancel your ${selectedRequest?.leaveType} request for ${formatDate(selectedRequest?.startDate)}? This cannot be undone.`"
      confirm-label="Yes, cancel it"
      confirm-color="#B91C1C"
      :loading="deleteLoading"
      @confirm="onConfirmCancel"
    />
  </AppShell>
</template>

<style scoped>
/* Exact same tab badge styling as LeaveRequests.vue */
.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #58111A;
  color: white;
}

.tab-count--active {
  background: white;
  color: #58111A;
}

@media (max-width: 599px) {
  .v-btn {
    padding: 6px 12px;
    font-size: 0.8125rem;
  }
}
</style>