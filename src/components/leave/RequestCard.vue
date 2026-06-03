<script setup>
import { computed } from 'vue'
import { useWorkingDays } from '../../composables/useWorkingDays.js'
import RequestStatusChip from './RequestStatusChip.vue'
// import StatusChip from '@/components/leave/StatusChip.vue'

// Card used in HR Leave Requests view to display a single leave request
const props = defineProps({
  request: {
    type: Object,
    required: true,
    // Expected shape: { id, employeeName, department, leaveType, status, startDate, endDate, reason, submittedAt }
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['approve', 'reject'])

const { calculateWorkingDays, formatDate } = useWorkingDays()

function getLeaveTypeColor(type) {
  const t = type?.toLowerCase()
  if (t?.includes('annual')) return { bg: '#EDE9FE', textClass: 'text-deep-purple-darken-2' }
  if (t?.includes('sick')) return { bg: '#E0F2FE', textClass: 'text-blue-darken-3' }
  if (t?.includes('other')) return { bg: '#F1F5F9', textClass: 'text-grey-darken-3' }
  if (t?.includes('unpaid')) return { bg: '#FEF3C7', textClass: 'text-amber-darken-4' }
  return { bg: '#F5F4F0', textClass: 'text-grey-darken-3' }
}

const workingDays = computed(() =>
  calculateWorkingDays(props.request.startDate, props.request.endDate)
)

const leaveTypeStyle = computed(() => getLeaveTypeColor(props.request.leaveType))
</script>

<template>
  <v-card
    class="pa-5 mb-4"
    variant="flat"
    color="#58111A"
  >
    <!-- Header row: avatar + name + chips -->
    <div class="d-flex align-start justify-space-between mb-4">
      <div class="d-flex align-center ga-3">
        <div>
          <div class="font-weight-bold" style="font-size: 1.6rem;">
            {{ request.employeeName }}
          </div>
          <div class="text-caption"> Department: {{ request.department }}</div>
        </div>
      </div>

      <div class="d-flex align-center ga-2 flex-wrap">
        <RequestStatusChip :status="request.status" />
        <v-chip
          :color="leaveTypeStyle.bg"
          :class="leaveTypeStyle.textClass + ' font-weight-bold rounded-pill px-3'"
          variant="flat"
          size="small"
        >
          {{ request.leaveType }}
        </v-chip>
      </div>
    </div>

    <!-- Date + working days row -->
    <div class="d-flex align-center ga-6 mb-3 flex-wrap">
      <div class="d-flex align-center ga-2">
        <v-icon size="16" color="white">mdi-calendar-range-outline</v-icon>
        <span>{{ formatDate(request.startDate) }} – {{ formatDate(request.endDate) }}</span>
      </div>
      <div class="d-flex align-center ga-2">
        <v-icon size="16" color="white">mdi-clock-outline</v-icon>
        <span>{{ workingDays }} working {{ workingDays === 1 ? 'day' : 'days' }}</span>
      </div>
    </div>

    <!-- Reason note -->
    <div
      v-if="request.reason"
      class="py-3 px-5 mb-4 rounded-lg font-weight-medium"
      style="background-color: white; color: #58111A;"
    >
    {{ request.reason }}
    </div>

    <!-- Action buttons (only shown for pending requests) -->
    <div v-if="request.status?.toLowerCase() === 'pending'" class="d-flex ga-4 mb-3">
      <v-btn
        variant="flat"
        rounded="lg"
        class="text-capitalize font-weight-medium flex-1-1"
        style="background-color: white; color: #58111A;"
        prepend-icon="mdi-close"
        :loading="loading"
        @click="emit('reject', request)"
      >
        Reject
      </v-btn>
      <v-btn
        variant="flat"
        rounded="lg"
        class="text-capitalize font-weight-medium flex-1-1"
        style="background-color: white; color: #58111A;"
        prepend-icon="mdi-check"
        :loading="loading"
        @click="emit('approve', request)"
      >
        Approve
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>

</style>
