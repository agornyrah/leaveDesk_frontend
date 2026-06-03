<script setup>
import { ref, watch } from 'vue'
import { useEmployeeStore } from '../../stores/employee.store.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  employee: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const employeeStore = useEmployeeStore()
const formRef = ref(null)

const name = ref('')
const email = ref('')
const role = ref('worker')
const department = ref('')
const isFormValid = ref(true)
const isLoading = ref(false)
const errorMessage = ref('')

// Corporate departments list
const departments = [
  'Administration',
  'IT - Apps',
  'Data Center',
  'Brands',
  'Accounts',
  'Project Management',
  'Projects',
  'Networking',
  'Cyber Security',
]

const roles = [
  { title: 'Worker (Employee)', value: 'worker' },
  { title: 'HR Admin', value: 'hr' }
]

const nameRules = [
  v => !!v || 'Name is required',
  v => v.trim().length >= 2 || 'Name must be at least 2 characters'
]

const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const departmentRules = [
  (value) => {
    if (role.value === 'worker') {
      return !!value || "Department is required for workers"
    }
    return true
  }
]

// Sync form values when the employee prop updates
watch(() => props.employee, (newEmp) => {
  if (newEmp) {
    name.value = newEmp.name || ''
    email.value = newEmp.email || ''
    role.value = newEmp.role || 'worker'
    department.value = newEmp.department || ''
  }
}, { immediate: true })

// Watch role to clear department if user is changed to HR
watch(role, (newRole) => {
  if (newRole !== 'worker') {
    department.value = ''
  }
})

function closeDialog() {
  emit('update:modelValue', false)
  errorMessage.value = ''
  formRef.value?.resetValidation()
}

async function onSubmit() {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const success = await employeeStore.updateEmployee(
      props.employee.id,
      name.value,
      email.value,
      role.value,
      role.value === 'worker' ? department.value : ''
    )
    if (success) {
      emit('saved')
      closeDialog()
    } else {
      errorMessage.value = employeeStore.error || 'Failed to update employee details.'
    }
  } catch (err) {
    errorMessage.value = 'An unexpected error occurred.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="500px"
    persistent
  >
    <v-card class="pa-6 rounded-xl" elevation="10" style="border: 1px solid rgba(88, 17, 26, 0.1);">
      <!-- Title -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-h5 font-weight-bold" style="color: #58111A; letter-spacing: -0.5px;">
          <v-icon class="mr-2" color="#58111A">mdi-account-edit-outline</v-icon>
          Edit Employee Details
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          color="#58111A"
          @click="closeDialog"
        />
      </div>

      <v-divider class="mb-5" style="color: #58111A;" />

      <!-- Error message -->
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4 rounded-lg"
        density="compact"
      >
        {{ errorMessage }}
      </v-alert>

      <!-- Form -->
      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="onSubmit">
        <!-- Name -->
        <div class="font-weight-bold mb-2">Full Name</div>
        <v-text-field
          v-model="name"
          placeholder="e.g. Ama Kusi"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details="auto"
          class="mb-4"
          :rules="nameRules"
          prepend-inner-icon="mdi-account-outline"
        />

        <!-- Email -->
        <div class="font-weight-bold mb-2">Email Address</div>
        <v-text-field
          v-model="email"
          placeholder="e.g. ama@company.com"
          type="email"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details="auto"
          class="mb-4"
          :rules="emailRules"
          prepend-inner-icon="mdi-email-outline"
        />

        <!-- Role -->
        <div class="font-weight-bold mb-2">System Role</div>
        <v-select
          v-model="role"
          :items="roles"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details="auto"
          class="mb-6"
          prepend-inner-icon="mdi-shield-account-outline"
        />

        <v-expand-transition>
          <div v-if="role === 'worker'">
            <div class="font-weight-bold mb-2 mt-n2">Department</div>
            <v-select
              v-model="department"
              :items="departments"
              label="Select Department"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              hide-details="auto"
              :rules="departmentRules"
              prepend-inner-icon="mdi-domain"
            ></v-select>
          </div>
        </v-expand-transition>

        <!-- Actions -->
        <div class="d-flex justify-end ga-3 mt-10">
          <v-btn
            variant="outlined"
            rounded="lg"
            class="text-capitalize font-weight-bold"
            color="grey-darken-3"
            style="border-color: rgba(0, 0, 0, 0.12);"
            :disabled="isLoading"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            type="submit"
            variant="flat"
            rounded="lg"
            color="#58111A"
            class="text-capitalize font-weight-bold px-6"
            :loading="isLoading"
            :disabled="!isFormValid"
          >
            Save Changes
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>