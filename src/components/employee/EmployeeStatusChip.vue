<script setup>
import { EMPLOYEE_STATUS } from '../../constants/employeeStatus.js'

defineProps({
  status: {
    type: String,
    required: true,
  },
})

function getStatusConfig(statusName) {
  return EMPLOYEE_STATUS.find(
    s => s.name.toLowerCase() === statusName?.toLowerCase()
  ) || EMPLOYEE_STATUS[0]
}

const statusColorMap = {
  blue: {
    bg: '#E0F2FE',
    textClass: 'text-blue-darken-3',
  },
  green: {
    bg: '#D1FAE5',
    textClass: 'text-green-darken-3',
  },
  red: {
    bg: '#FEE2E2',
    textClass: 'text-red-darken-3',
  },
}

function getChipStyle(statusName) {
  const config = getStatusConfig(statusName)

  return statusColorMap[config.color] || statusColorMap.blue
}
</script>

<template>
  <v-chip
    :color="getChipStyle(status).bg"
    :class="getChipStyle(status).textClass + ' font-weight-bold rounded-pill px-3'"
    variant="flat"
    size="small"
  >
    {{ status }}
  </v-chip>
</template>