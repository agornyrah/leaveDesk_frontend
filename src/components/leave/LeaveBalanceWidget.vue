<script setup>
// Displays a single leave balance stat card
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  highlight: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <v-card
    class="pa-4 rounded-xl text-center"
    :color="highlight ? '#EDE9FE' : '#F5F4F0'"
    variant="flat"
  >
    <div class="text-caption text-grey-darken-1 font-weight-semibold mb-1">
      {{ title }}
    </div>
    <div
      class="text-h4 font-weight-bold my-1"
      :class="highlight ? 'text-deep-purple-darken-2' : 'text-grey-darken-4'"
    >
      {{ value }}
    </div>
    <div v-if="subtitle" class="text-caption text-grey-darken-1">
      {{ subtitle }}
    </div>
  </v-card>
</template>
