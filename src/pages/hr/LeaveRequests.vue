<script setup>
import { ref, computed, onMounted } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import RequestCard from '../../components/leave/RequestCard.vue'
import EmptyState from '../../components/shared/EmptyState.vue'
import ConfirmDialog from '../../components/shared/ConfirmDialog.vue'
import { useRequestsStore } from '../../stores/requests.store.js'
import { storeToRefs } from 'pinia'

const requestsStore = useRequestsStore()
const { allLeaveRequests, isLoading } = storeToRefs(requestsStore)

// Active tab: 'pending' | 'approved' | 'rejected' | 'all'
const activeTab = ref('pending')

// Confirm dialog state
const confirmDialog = ref(false)
const confirmAction = ref(null) // 'approve' | 'reject'
const selectedRequest = ref(null)
const actionLoading = ref(false)

// Use store data if available
const requests = computed(() => allLeaveRequests.value)

const tabs = computed(() => [
  { key: 'pending', label: 'Pending', count: requests.value.filter((r) => r.status?.toLowerCase() === 'pending').length },
  { 
    key: 'approved', 
    label: 'Approved', 
    count: requests.value.filter(r => r.status?.toLowerCase() === 'approved' || r.status?.toLowerCase() === 'on leave').length 
  },
  { key: 'rejected', label: 'Rejected', count: requests.value.filter((r) => r.status?.toLowerCase() === 'rejected').length },
  { key: 'all', label: 'All', count: requests.value.length },
])

const filteredRequests = computed(() => {
  if (activeTab.value === 'all') return requests.value
  if (activeTab.value === 'approved'){
    return requests.value.filter(r => r.status?.toLowerCase() === 'approved' || r.status?.toLowerCase() === 'on leave')
  }
  return requests.value.filter((r) => r.status?.toLowerCase() === activeTab.value)
})

function onApprove(request) {
  selectedRequest.value = request
  confirmAction.value = 'approve'
  confirmDialog.value = true
}

function onReject(request) {
  selectedRequest.value = request
  confirmAction.value = 'reject'
  confirmDialog.value = true
}

async function onConfirmAction() {
  if (!selectedRequest.value) return
  actionLoading.value = true

  const newStatus = confirmAction.value === 'approve' ? 'Approved' : 'Rejected'

  try {
    await requestsStore.updateRequest(selectedRequest.value.id, {
      ...selectedRequest.value,
      status: newStatus,
    })
  } catch (err) {
    console.warn('Failed to update request in backend, running fallback offline update:', err)

    const idx = requestsStore.allLeaveRequests.findIndex(
      r => r.id === selectedRequest.value.id
    )

    if (idx !== -1) {
      requestsStore.allLeaveRequests[idx].status = newStatus
    }
  } finally {
    actionLoading.value = false
    confirmDialog.value = false
    selectedRequest.value = null
  }
}

onMounted(async () => {
  try {
    await requestsStore.getAllRequests()
  } catch (err) {
    console.error('Failed to fetch requests:', err)
  }
})
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
            Leave Requests
          </h1>
        </v-col>
      </v-row>

      <!-- Status Tabs -->
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

      <!-- Loading skeleton -->
      <div v-if="isLoading">
        <v-skeleton-loader
          v-for="i in 3"
          :key="i"
          type="card"
          class="mb-4 rounded-xl"
        />
      </div>

      <!-- Request cards -->
      <template v-else>
        <RequestCard
          v-for="request in filteredRequests"
          :key="request.id"
          :request="request"
          @approve="onApprove"
          @reject="onReject"
        />

        <EmptyState
          v-if="filteredRequests.length === 0"
          icon="mdi-clipboard-check-outline"
          :title="activeTab === 'pending' ? 'No pending requests' : 'No requests found'"
          :subtitle="activeTab === 'pending' ? 'All caught up — no leave requests awaiting review.' : 'There are no requests in this category yet.'"
        />
      </template>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-model="confirmDialog"
      :title="confirmAction === 'approve' ? 'Approve request?' : 'Reject request?'"
      :message="
        confirmAction === 'approve'
          ? `Approve ${selectedRequest?.employeeName}'s leave request? They will be notified.`
          : `Reject ${selectedRequest?.employeeName}'s leave request? They will be notified.`
      "
      :confirm-label="confirmAction === 'approve' ? 'Approve' : 'Reject'"
      :confirm-color="confirmAction === 'approve' ? '#0F766E' : '#B91C1C'"
      :loading="actionLoading"
      @confirm="onConfirmAction"
    />
  </AppShell>
</template>

<style scoped>
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
