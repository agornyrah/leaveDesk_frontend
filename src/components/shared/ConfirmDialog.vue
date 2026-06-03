<script setup>
// Reusable confirmation dialog redesigned to match Add/Edit Employee modals
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Are you sure?',
  },
  message: {
    type: String,
    default: 'This action cannot be undone.',
  },
  confirmLabel: {
    type: String,
    default: 'Confirm',
  },
  cancelLabel: {
    type: String,
    default: 'Cancel',
  },
  confirmColor: {
    type: String,
    default: '#58111A',
  },
  icon: {
    type: String,
    default: 'mdi-help-circle-outline'
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="460"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card 
      class="pa-6 rounded-xl border-sm" 
      style="border-color: rgba(88, 17, 26, 0.12) !important;"
      variant="flat" 
      color="white"
      elevation="10"
    >
      <!-- Title Header Bar -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-h5 font-weight-bold d-flex align-center" style="color: #58111A; letter-spacing: -0.5px;">
          <v-icon class="mr-2" color="#58111A">{{ icon }}</v-icon>
          {{ title }}
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          color="grey-darken-1"
          @click="onCancel"
        />
      </div>

      <v-divider class="mb-5" />

      <!-- Dialog Core Message -->
      <div class="text-body-1 mb-6 text-grey-darken-3 font-weight-medium">
        {{ message }}
      </div>

      <!-- Consistent Actions Layout -->
      <div class="d-flex justify-end ga-3">
        <v-btn
          variant="outlined"
          rounded="lg"
          class="text-capitalize font-weight-bold"
          color="grey-darken-3"
          style="border-color: rgba(0, 0, 0, 0.12);"
          :disabled="loading"
          @click="onCancel"
        >
          {{ cancelLabel }}
        </v-btn>
        <v-btn
          variant="flat"
          rounded="lg"
          class="text-capitalize font-weight-bold px-6"
          :color="confirmColor"
          :loading="loading"
          @click="onConfirm"
        >
          {{ confirmLabel }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>