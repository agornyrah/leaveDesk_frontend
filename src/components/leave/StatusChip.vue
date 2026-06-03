<script setup>
// Displays a styled status chip for leave request statuses
defineProps({
  status: {
    type: String,
    required: true,
  },
})

function getChipStyle(status) {
  const s = status?.toLowerCase()
  if (s === 'approved' || s === 'on leave') {
    return { bg: '#D1FAE5', textClass: 'text-green-darken-3' }
  }
  if (s === 'rejected') {
    return { bg: '#FEE2E2', textClass: 'text-red-darken-3' }
  }
  // pending / default
  return { bg: '#FEF3C7', textClass: 'text-amber-darken-4' }
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
