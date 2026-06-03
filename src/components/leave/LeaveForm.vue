<script setup>
import { ref, computed, watch } from 'vue'
import { LEAVE_TYPES } from '../../constants/leaveTypes.js'
import { useWorkingDays } from '../../composables/useWorkingDays.js'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const { calculateWorkingDays } = useWorkingDays()

const formRef = ref(null)
const isFormValid = ref(true)

const leaveType = ref('')
const startDate = ref('')
const endDate = ref('')
const reason = ref('')

const leaveTypeItems = LEAVE_TYPES.map((t) => ({ title: t.name, value: t.name }))

const workingDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  return calculateWorkingDays(startDate.value, endDate.value)
})

// Reset end date if it's before start date
watch(startDate, (val) => {
  if (endDate.value && val > endDate.value) {
    endDate.value = ''
  }
})

const leaveTypeRules = [(v) => !!v || 'Leave type is required']
const startDateRules = [(v) => !!v || 'Start date is required']
const endDateRules = [
  (v) => !!v || 'End date is required',
  (v) => !startDate.value || v >= startDate.value || 'End date must be on or after start date',
]

async function onSubmit() {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  emit('submit', {
    leaveType: leaveType.value,
    startDate: startDate.value,
    endDate: endDate.value,
    reason: reason.value,
    workingDays: workingDays.value,
  })
}

function onCancel() {
  formRef.value?.reset()
  emit('cancel')
}
</script>

<template>
  <v-form ref="formRef" v-model="isFormValid" @submit.prevent="onSubmit">
    <!-- Leave Type -->
    <div class="text-body-2 font-weight-bold text-grey-darken-3 mb-2">Leave type</div>
    <v-select
      v-model="leaveType"
      :items="leaveTypeItems"
      placeholder="Select leave type"
      variant="outlined"
      density="comfortable"
      rounded="lg"
      hide-details="auto"
      class="mb-5"
      :rules="leaveTypeRules"
      prepend-inner-icon="mdi-tag-outline"
    />

    <!-- Date Range -->
    <div class="text-body-2 font-weight-bold text-grey-darken-3 mb-2">Date range</div>
    <v-row class="mb-5">
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="startDate"
          label="Start date"
          type="date"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details="auto"
          :rules="startDateRules"
          prepend-inner-icon="mdi-calendar-start-outline"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="endDate"
          label="End date"
          type="date"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details="auto"
          :rules="endDateRules"
          :min="startDate"
          prepend-inner-icon="mdi-calendar-end-outline"
        />
      </v-col>
    </v-row>

    <!-- Working days preview -->
    <div
      v-if="workingDays > 0"
      class="d-flex align-center ga-2 pa-3 rounded-lg mb-5"
      style="background-color: #F5F4F0;"
    >
      <v-icon size="18" color="teal-darken-2">mdi-clock-check-outline</v-icon>
      <span class="text-body-2 font-weight-bold text-grey-darken-3">
        {{ workingDays }} working {{ workingDays === 1 ? 'day' : 'days' }}
      </span>
    </div>

    <!-- Reason -->
    <div class="text-body-2 font-weight-bold text-grey-darken-3 mb-2">
      Reason <span class="font-weight-regular text-grey">(optional)</span>
    </div>
    <v-textarea
      v-model="reason"
      placeholder="Add a note for your manager..."
      variant="outlined"
      density="comfortable"
      rounded="lg"
      hide-details
      rows="3"
      class="mb-6"
    />

    <!-- Actions -->
    <div class="d-flex ga-3">
      <v-btn
        variant="outlined"
        rounded="lg"
        class="text-capitalize font-weight-bold text-grey-darken-3"
        style="border-color: rgba(0,0,0,0.12);"
        @click="onCancel"
      >
        Cancel
      </v-btn>
      <v-btn
        type="submit"
        variant="flat"
        rounded="lg"
        color="#58111A"
        class="text-capitalize font-weight-bold"
        :loading="loading"
        :disabled="!isFormValid"
      >
        Submit request
      </v-btn>
    </div>
  </v-form>
</template>
