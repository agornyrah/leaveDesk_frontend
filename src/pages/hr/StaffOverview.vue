<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppShell from '../../components/layout/AppShell.vue'
import { useEmployeeStore } from '../../stores/employee.store.js'
import { useRequestsStore } from '../../stores/requests.store.js'
import { useSettingsStore } from '../../stores/settings.store.js'
import { useLeaveBalance } from '../../composables/useLeaveBalance.js'
import AddEmployee from '../../components/shared/AddEmployee.vue'
import EmployeeStatusChip from '../../components/employee/EmployeeStatusChip.vue'

const showAddDialog = ref(false)
const employeeStore = useEmployeeStore()
const requestsStore = useRequestsStore()
const settingsStore = useSettingsStore()

const { calculateRemainingLeaves } = useLeaveBalance()
const { allEmployees, isLoading } = storeToRefs(employeeStore)
const { allLeaveRequests} = storeToRefs(requestsStore)

const searchQuery = ref('')

//Helper function to clear search
function onClick() {
  searchQuery.value = ''
}

const page = ref(1)
const itemsPerPage = ref(10)

// Table headers configuration
const headers = [
  { 
    title: 'Employee', 
    key: 'name', 
    sortable: true,
    align: 'start',
    minWidth: '200px',
    width: '30%',
  },
  { 
    title: 'Status', 
    key: 'status', 
    sortable: true,
    align: 'start',
    minWidth: '120px',
    width: '15%',
  },
  { 
    title: 'Leave Balance', 
    key: 'leaveBalance', 
    sortable: true,
    align: 'start',
    minWidth: '180px',
    width: '25%',
  },
  { 
    title: 'Days Left', 
    key: 'daysLeft', 
    sortable: true,
    align: 'start',
    minWidth: '100px',
    width: '15%',
  },
  { 
    title: 'Actions', 
    key: 'actions', 
    sortable: false,
    align: 'end',
    minWidth: '100px',
    width: '15%',
  },
]

function getProgressBarColor(days) {
  // if (days < 10) return '#58111A'
  return '#58111A'
}

const totalLeaveAllowance = computed(() =>
  settingsStore.annualLeaveAllowance + settingsStore.sickLeaveAllowance
)


//Helper to calculate whether the employee is on leave today using approved requests.
function isEmployeeOnLeaveToday(employeeId) {
  const today = new Date().toISOString().split('T')[0]

  return allLeaveRequests.value.some(req => {
    const status = req.status?.toLowerCase()

    const isApproved = status === 'approved' || status === 'on leave'
    const belongsToEmployee = String(req.employeeId) === String(employeeId)

    return (
      belongsToEmployee &&
      isApproved &&
      req.startDate <= today &&
      today <= req.endDate
    )
  })
}

// Transform API data to match UI requirements
const employees = computed(() => {
  return allEmployees.value.map(emp => {
    const approvedRequests = allLeaveRequests.value.filter(req =>
      String(req.employeeId) === String(emp.id) &&
      ['approved', 'on leave'].includes(req.status?.toLowerCase())
    )

    const annualDaysLeft = calculateRemainingLeaves(
      approvedRequests,
      'Annual Leave'
    )

    const sickDaysLeft = calculateRemainingLeaves(
      approvedRequests,
      'Sick Leave'
    )

    return {
      id: emp.id,
      name: emp.name,
      department: emp.department || 'N/A',
      status: emp.status?.toLowerCase() === 'inactive' ? 'Inactive' : isEmployeeOnLeaveToday(emp.id) ? 'On leave' : 'Active',
      daysLeft: annualDaysLeft + sickDaysLeft,
    }
  })
})

// Stats computed from real data
const hrStats = computed(() => [
  { title: 'Total staff', count: allEmployees.value.length },
  { 
    title: 'On leave today', 
    count: allEmployees.value.filter(e => e.status?.toLowerCase() !== 'inactive' && isEmployeeOnLeaveToday(e.id)).length
  },
  { 
    title: 'Pending requests', 
    count: allLeaveRequests.value.filter(r => r.status?.toLowerCase() === 'pending').length
  },
])

// Fetch employees on mount
onMounted(async () => {
  try {
    await employeeStore.getAllEmployees()
    await requestsStore.getAllRequests()
  } catch (err) {
    console.error('Failed to fetch employees:', err)
  }
})

onMounted(() => {
  settingsStore.getSettings()
})

</script>

<template>
  <AppShell>
    <div style="max-width: 1000px;margin: 0 auto; padding: 0 16px;">
      <!-- Header Area -->
      <v-row class="d-flex mb-2 align-center justify-space-between">
        <v-col cols="12" sm="4" class="d-flex justify-start">
          <h1 class="font-weight-bold text-display-medium" style="letter-spacing: 0.5px; color: #58111A !important;">Staff Overview</h1>
        </v-col>
        <v-col cols="12" sm="4" class="d-flex justify-md-end">
          <v-btn
            prepend-icon="mdi-plus"
            class="font-weight-bold px-4"
            variant="tonal"
            color="#58111A"
            @click="showAddDialog = true"
          >
            Add Employee
          </v-btn>
        </v-col>
      </v-row>

      <!-- Stats Cards -->
      <v-row class="mb-6">
        <v-col
          v-for="(stat, i) in hrStats"
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

      <!-- Search Input -->
      <v-row class="mb-6">
        <v-col cols="12" sm="4" md="12">
          <v-text-field
            v-model="searchQuery"
            :loading="isLoading"
            append-inner-icon="mdi-magnify"
            density="comfortable"
            label="Search Staff"
            variant="outlined"
            style="color: #58111A;"
            hide-details
            single-line
            @click:append-inner="onClick"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Staff List with Scrollable Data Table -->
      <div class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="employees"
          :search="searchQuery"
          :loading="isLoading"
          :items-per-page="itemsPerPage"
          v-model:page="page"
          hover
          density="comfortable"
          fixed-header
        >
          <!-- Custom slot for Employee column -->
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center ga-3 py-4" style="min-width: 200px;">
              <div class="text-truncate">
                <div class="font-weight-bold text-truncate text-body-large" style="color: #58111A; letter-spacing: 0.5px;">
                  {{ item.name }}
                </div>
                <div class="text-caption text-truncate" style="color: #58111A;">
                  Department: {{ item.department }}
                </div>
              </div>
            </div>
          </template>

          <!-- Custom slot for Status column using constants -->
          <template v-slot:item.status="{ item }">
            <EmployeeStatusChip :status="item.status" />
          </template>

          <!-- Custom slot for Leave Balance column -->
          <template v-slot:item.leaveBalance="{ item }">
            <div style="min-width: 150px; padding-right: 16px;">
              <v-progress-linear
                :model-value="100 - ((item.daysLeft / totalLeaveAllowance) * 100)"
                :color="getProgressBarColor(item.daysLeft)"
                height="6"
                rounded
                bg-color="grey-lighten-3"
                bg-opacity="1"
              />
            </div>
          </template>

          <!-- Custom slot for Days Left column -->
          <template v-slot:item.daysLeft="{ item }">
            <span class="text-body-2 font-weight-semibold text-grey-darken-3" style="white-space: nowrap;">
              {{ item.daysLeft }} days
            </span>
          </template>

          <!-- Custom slot for Actions column -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              variant="outlined"
              color="#58111A"
              size="small"
              class="rounded-xl font-weight-bold px-8"
              height="30"
              style="border-color: #58111A;"
              @click="$router.push({ name: 'EmployeeProfile', query: { id: item.id } })"
            >
              View
            </v-btn>
          </template>

          <!-- Custom loading slot -->
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@5" />
          </template>

          <!-- Custom no-data slot -->
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="48" color="#58111A" class="mb-2">
                mdi-account-group-outline
              </v-icon>
              <div style="color: #58111A;">
                {{ searchQuery ? 'No employees match your search.' : 'No employees found.' }}
              </div>
            </div>
          </template>

          <!-- Custom bottom slot for pagination -->
          <template v-slot:bottom>
            <div class="d-flex flex-column flex-sm-row align-center justify-space-between pa-4 ga-3">
              <div class="text-center text-sm-left" style="color: #58111A;">
                Showing {{ ((page - 1) * itemsPerPage) + 1 }} to 
                {{ Math.min(page * itemsPerPage, employees.length) }} of 
                {{ employees.length }} employees
              </div>
              <v-pagination
                v-model="page"
                :length="Math.ceil(employees.length / itemsPerPage)"
                :total-visible="5"
                rounded="circle"
                density="comfortable"
                size="small"
              />
            </div>
          </template>
        </v-data-table>
      </div>
    </div>
  </AppShell>
  
  <AddEmployee v-model="showAddDialog" @saved="employeeStore.getAllEmployees()"/>
</template>
