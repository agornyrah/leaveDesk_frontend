<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppShell from '../../components/layout/AppShell.vue'
import { useEmployeeStore } from '../../stores/employee.store.js'
import { useRequestsStore } from '../../stores/requests.store.js'
import { LEAVE_TYPES } from '../../constants/leaveTypes.js'
import EditEmployee from '../../components/shared/EditEmployee.vue'
import ConfirmDialog from '../../components/shared/ConfirmDialog.vue'
import RequestStatusChip from '../../components/leave/RequestStatusChip.vue'
import { useLeaveBalance } from '../../composables/useLeaveBalance.js'
import { useWorkingDays } from '../../composables/useWorkingDays.js'
import { useSettingsStore } from '../../stores/settings.store.js'

const showEditDialog = ref(false)
const showDeactivateDialog = ref(false)
const showPermanentDeleteDialog = ref(false)
const route = useRoute()
const router = useRouter()

const { calculateWorkingDays } = useWorkingDays()
const { calculateRemainingLeaves } = useLeaveBalance()
const employeeStore = useEmployeeStore()
const requestsStore = useRequestsStore()
const settingsStore = useSettingsStore()
const { allEmployees, isLoading } = storeToRefs(employeeStore)
const { allLeaveRequests } = storeToRefs(requestsStore)


const isInactive = computed(() =>
  employee.value?.status?.toLowerCase() === 'inactive'
)

// Resolve the employee from the store using the query param
const employee = computed(() => {
  const id = route.query.id
  return allEmployees.value.find(e => String(e.id) === String(id)) || null
})

// Balance stat cards — same outlined pattern as StaffOverview hrStats
const balanceStats = computed(() => [
  {
    title: 'Annual left',
    count: calculateRemainingLeaves(approvedEmployeeRequests.value, 'Annual Leave'),
  },
  {
    title: 'Sick left',
    count: calculateRemainingLeaves(approvedEmployeeRequests.value, 'Sick Leave'),
  },
  {
    title: 'Used Leaves',
    count: approvedEmployeeRequests.value.reduce((total, req) => total + calculateWorkingDays(req.startDate, req.endDate), 0),
  },
])

const approvedEmployeeRequests = computed(() => {
  if (!employee.value) return []

  return allLeaveRequests.value.filter(req =>
    String(req.employeeId) === String(employee.value.id) &&
    ['approved', 'on leave'].includes(req.status?.toLowerCase())
  )
})

// Table headers — same config shape as StaffOverview
const headers = [
  {
    title: 'Dates',
    key: 'dates',
    sortable: false,
    align: 'start',
    minWidth: '180px',
    width: '25%',
  },
  {
    title: 'Type',
    key: 'leaveType',
    sortable: true,
    align: 'start',
    minWidth: '120px',
    width: '20%',
  },
  {
    title: 'Days',
    key: 'days',
    sortable: true,
    align: 'start',
    minWidth: '80px',
    width: '15%',
  },
  {
    title: 'Status',
    key: 'status',
    sortable: true,
    align: 'start',
    minWidth: '120px',
    width: '20%',
  },
  {
    title: 'Submitted',
    key: 'submittedAt',
    sortable: true,
    align: 'end',
    minWidth: '130px',
    width: '20%',
  },
]

// Request history — adapt from the employee's requests array
const requestHistory = computed(() => {
  if (!employee.value) return []

  return allLeaveRequests.value
    .filter(req => String(req.employeeId) === String(employee.value.id))
    .map(req => ({
      id: req.id,
      startDate: req.startDate,
      endDate: req.endDate,
      leaveType: req.leaveType || 'Others',
      days: calculateWorkingDays(req.startDate, req.endDate),
      status: req.status || 'Pending',
      submittedAt: req.submittedAt || req.createdAt,
    }))
})

// Map each leave type code to a chip style
const leaveTypeColorMap = {
  'AL': { bg: '#EDE9FE', textClass: 'text-deep-purple-darken-2' },
  'SL': { bg: '#E0F2FE', textClass: 'text-blue-darken-3' },
  'OR': { bg: '#F1F5F9', textClass: 'text-grey-darken-3' },
}

function getLeaveTypeConfig(typeName) {
  return LEAVE_TYPES.find(
    t => t.name.toLowerCase() === typeName?.toLowerCase()
  ) || LEAVE_TYPES[0]
}

function getLeaveTypeStyle(typeName) {
  const config = getLeaveTypeConfig(typeName)
  return leaveTypeColorMap[config.code] || { bg: '#F5F4F0', textClass: 'text-grey-darken-3' }
}

function formatDateRange(start, end) {
  const fmt = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  }
  return `${fmt(start)} - ${fmt(end)}`
}

function formatSubmitted(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

onMounted(async () => {
  try {
    await Promise.all([
      allEmployees.value.length === 0
        ? employeeStore.getAllEmployees()
        : Promise.resolve(),
      requestsStore.getAllRequests(),
      settingsStore.getSettings(),
    ])
  } catch (err) {
    console.error('Failed to fetch employee profile data:', err)
  }
})

async function deactivateEmployee() {
  if (!employee.value) return

  const success = await employeeStore.deactivateEmployee(employee.value.id)

  if (success) {
    showDeactivateDialog.value = false
    await employeeStore.getAllEmployees()
  }
}

async function activateEmployee() {
  if (!employee.value) return

  const success = await employeeStore.activateEmployee(employee.value.id)

  if (success) {
    await employeeStore.getAllEmployees()
    router.push({ name: 'StaffOverview' })
  }
}

async function permanentlyDeleteEmployee() {
  if (!employee.value) return

  const success = await employeeStore.permanentlyDeleteEmployee(employee.value.id)

  if (success) {
    showPermanentDeleteDialog.value = false
    router.push({ name: 'StaffOverview' })
  }
}

// Send message through employees registered email
function sendMessage() {
  if (employee.value?.email) {
    const subject = encodeURIComponent('LeaveDesk Inquiry')
    const body = encodeURIComponent(`Hi ${employee.value.name},\n\nI am contacting you regarding your leave requests...\n\nBest regards,\nHR Admin`)
    window.location.href = `mailto:${employee.value.email}?subject=${subject}&body=${body}`
  }
}

</script>

<template>
  <AppShell>
    <div style="max-width: 1000px; margin: 0 auto; padding: 0 16px;">

      <!-- Back Button -->
      <v-row class="mb-2">
        <v-col cols="12">
          <v-btn
            variant="tonal"
            prepend-icon="mdi-arrow-left"
            class="font-weight-bold px-4"
            style="color: #58111A;"
            @click="router.push({ name: 'StaffOverview' })"
          >
            Back to staff
          </v-btn>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <template v-if="isLoading && !employee">
        <v-skeleton-loader type="heading" class="mb-4" />
        <v-row class="mb-6">
          <v-col v-for="n in 4" :key="n" cols="12" sm="3">
            <v-skeleton-loader type="card" />
          </v-col>
        </v-row>
        <v-skeleton-loader type="table-row@5" />
      </template>

      <!-- Employee Not Found -->
      <template v-else-if="!employee && !isLoading">
        <div class="text-center py-16">
          <v-icon size="64" color="#58111A" class="mb-4">
            mdi-account-off-outline
          </v-icon>
          <div class="font-weight-bold text-h5 mb-2" style="color: #58111A;">
            Employee not found
          </div>
          <div class="text-body-2 text-grey-darken-1 mb-6">
            The employee you're looking for doesn't exist or has been removed.
          </div>
          <v-btn
            variant="outlined"
            color="#58111A"
            class="rounded-xl font-weight-bold px-8"
            @click="router.push({ name: 'StaffOverview' })"
          >
            Return to Staff Overview
          </v-btn>
        </div>
      </template>

      <!-- Main Content -->
      <template v-else>

        <!-- Employee Header -->
        <v-row class="d-flex mb-2 align-center justify-space-between">
          <v-col cols="12" sm="8" class="d-flex align-center ga-4">
            <div>
                <p class="font-weight-bold text-display-medium" style="letter-spacing: 0.5px; color: #58111A;">{{ employee.name }}</p>
                <p class="font-weight-bold text-subtitle mt-n10" style="letter-spacing: 0.5px; color: #58111A;">Department: {{ employee.department }}</p>
            </div>
          </v-col>
          <v-col cols="12" sm="4" class="d-flex justify-md-end ga-3 flex-wrap">
            <v-btn
              prepend-icon="mdi-pencil-outline"
              class="font-weight-bold px-8"
              variant="outlined"
              color="#58111A"
              :disabled="isInactive"
              @click="showEditDialog = true"
            >
              Edit Employee
            </v-btn>
            <v-btn
              v-if="isInactive"
              prepend-icon="mdi-account-check-outline"
              class="font-weight-bold px-13"
              variant="outlined"
              color="#58111A"
              @click="activateEmployee"
            >
              Activate
            </v-btn>
            <v-btn
              prepend-icon="mdi-email-outline"
              class="font-weight-bold px-4"
              variant="tonal"
              color="#58111A"
              :disabled="isInactive"
              @click="sendMessage"
            >
              Message Employee
            </v-btn>
            <v-btn
              v-if="!isInactive"
              prepend-icon="mdi-account-off-outline"
              class="font-weight-bold px-11"
              variant="outlined"
              color="#58111A"
              @click="showDeactivateDialog = true"
            >
              Deactivate
            </v-btn>
            <v-btn
              v-if="isInactive"
              prepend-icon="mdi-delete-outline"
              class="font-weight-bold px-4"
              variant="flat"
              color="#58111A"
              @click="showPermanentDeleteDialog = true"
            >
              Permanently Delete
            </v-btn>
          </v-col>
        </v-row>

        <!-- Balance Stat Cards (same pattern as StaffOverview hrStats) -->
        <v-row class="mb-6">
          <v-col
            v-for="(stat, i) in balanceStats"
            :key="i"
            cols="12"
            sm="4"
          >
            <v-card
              class="pa-5"
              color="#58111A"
              variant="outlined"
            >
              <div class="font-weight-medium mb-1">
                {{ stat.title }}
              </div>
              <div class="font-weight-bold" style="font-size: 40px;">
                {{ stat.count }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Section Title: Request History -->
        <v-row class="d-flex mb-2 align-center justify-space-between">
          <v-col cols="12" class="d-flex justify-start">
            <h2
              class="font-weight-bold text-h6"
              style="letter-spacing: 0.5px; color: #58111A !important;"
            >
              Individual Leave History
            </h2>
          </v-col>
        </v-row>

        <!-- Request History Data Table -->
        <div class="table-wrapper">
          <v-data-table
            :headers="headers"
            :items="requestHistory"
            :loading="isLoading"
            :items-per-page="5"
            hover
            density="comfortable"
            fixed-header
          >
            <!-- Dates column -->
            <template v-slot:item.dates="{ item }">
              <div class="py-4" style="min-width: 150px;">
                <div
                  class="font-weight-bold text-body-large"
                  style="color: #58111A; letter-spacing: 0.5px;"
                >
                  {{ formatDateRange(item.startDate, item.endDate) }}
                </div>
              </div>
            </template>

            <!-- Leave Type column -->
            <template v-slot:item.leaveType="{ item }">
              <v-chip
                :color="getLeaveTypeStyle(item.leaveType).bg"
                :class="getLeaveTypeStyle(item.leaveType).textClass + ' font-weight-bold rounded-pill px-3'"
                variant="flat"
                size="small"
              >
                {{ item.leaveType.replace(' Leave', '') }}
              </v-chip>
            </template>

            <!-- Days column -->
            <template v-slot:item.days="{ item }">
              <span
                class="font-weight-semibold text-grey-darken-3"
                style="white-space: nowrap;"
              >
                {{ item.days }} days
              </span>
            </template>

            <template v-slot:item.status="{ item }">
              <RequestStatusChip :status="item.status" />
            </template>

            <!-- Submitted date column -->
            <template v-slot:item.submittedAt="{ item }">
              <span class="text-grey-darken-1">
                {{ formatSubmitted(item.submittedAt) }}
              </span>
            </template>

            <!-- Loading slot -->
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@5" />
            </template>

            <!-- No-data slot -->
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="48" color="#58111A" class="mb-2">
                  mdi-clipboard-text-clock-outline
                </v-icon>
                <div style="color: #58111A;">
                  No request history found for this employee.
                </div>
              </div>
            </template>

            <!-- Pagination -->
            <template v-slot:bottom>
              <div class="d-flex flex-column flex-sm-row align-center justify-space-between pa-4 ga-3">
                <div class="text-center text-sm-left" style="color: #58111A;">
                  {{ requestHistory.length }} total requests
                </div>
              </div>
            </template>
          </v-data-table>
        </div>
      </template>
    </div>
  </AppShell>

  <EditEmployee
    v-if="employee"
    v-model="showEditDialog"
    :employee="employee"
    @saved="employeeStore.getAllEmployees()"
  />

  <ConfirmDialog
    v-model="showDeactivateDialog"
    title="Deactivate Employee"
    message="This employee will be marked inactive and will no longer be able to log in. Their leave history will remain available."
    confirm-label="Deactivate"
    confirm-color="#58111A"
    icon="mdi-account-off-outline"
    :loading="isLoading"
    @confirm="deactivateEmployee"
  />

  <ConfirmDialog
    v-model="showPermanentDeleteDialog"
    title="Delete Permanently"
    message="This will permanently remove the employee account. This action cannot be undone."
    confirm-label="Delete Permanently"
    confirm-color="#58111A"
    icon="mdi-delete-outline"
    :loading="isLoading"
    @confirm="permanentlyDeleteEmployee"
  />
</template>