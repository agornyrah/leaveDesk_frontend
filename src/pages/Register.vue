<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store.js'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)

const name = ref('')
const email = ref('')
const role = ref('worker') // default role
const department = ref('')
const password = ref('')
const confirmPassword = ref('')

const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isFormValid = ref(true)

// System roles for selection
const roles = [
  { title: 'Staff / Employee', value: 'worker' },
  { title: 'HR Manager', value: 'hr' }
]

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

// Rules
const nameRules = [
  (value) => !!value || "Full name is required",
  (value) => value.trim().split(' ').length >= 2 || "Please enter both first and last name",
]

const emailRules = [
  (value) => !!value || "Email is required",
  (value) => /.+@.+\..+/.test(value) || "E-mail must be valid",
]

const roleRules = [
  (value) => !!value || "Role selection is required",
]

const departmentRules = [
  (value) => {
    if (role.value === 'worker') {
      return !!value || "Department is required for workers"
    }
    return true
  }
]

const passwordRules = [
  (value) => !!value || "Password is required",
  (value) => value.length >= 6 || "Password must be at least 6 characters",
]

const confirmPasswordRules = [
  (value) => !!value || "Please confirm your password",
  (value) => value === password.value || "Passwords do not match",
]

async function onSubmit() {
  if (formRef.value) {
    const { valid } = await formRef.value.validate()
    if (!valid) {
      errorMessage.value = "Please complete the form correctly."
      return
    }
  }

  isLoading.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {

    const result = await authStore.register(
        name.value, 
        email.value, 
        role.value, 
        role.value === 'worker' ? department.value : null,
        password.value
    )

    if(result){
        successMessage.value = "Registration successful! Redirecting to login..."
        setTimeout(() => {
            router.push('/')
        }, 2000)
    }
    else{
        errorMessage.value = "Registration failed. Please try again."
    }

  } catch (error) {
    errorMessage.value = "An error occurred during registration. Please try again."
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <v-main class="d-flex align-center justify-center bg-grey-lighten-4 py-8">
    <v-card 
      class="pa-8 mx-auto" 
      width="100%"
      max-width="420"
      elevation="0"
      style="border: 0.5px solid #58111A; border-radius: 2px;"
    >
      <!-- Logo Section -->
      <div class="d-flex align-center justify-center mb-4">
          <v-avatar color="#F9ECEE" size="40" rounded="lg" class="mr-4">
            <v-icon color="#58111A" size="33">mdi-bag-checked</v-icon>
          </v-avatar>
        <span class="font-weight-bold text-h6 text-grey-darken-4">ARCH - LeaveDesk</span>
      </div>

      <!-- Title / Header -->
      <div class="text-center mb-6">
        <h2 class="text-h6 font-weight-bold">Create Account</h2>
      </div>

      <!-- Feedback Alerts -->
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
        density="compact"
      >
        {{ errorMessage }}
      </v-alert>

      <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        class="mb-4"
        density="compact"
      >
        {{ successMessage }}
      </v-alert>

      <!-- Registration Form -->
      <v-form ref="formRef" @submit.prevent="onSubmit" v-model="isFormValid">
        <!-- Full Name -->
        <v-text-field
          v-model="name"
          label="Full Name"
          type="text"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          :rules="nameRules"
          hide-details="auto"
          prepend-inner-icon="mdi-account-outline"
        ></v-text-field>

        <!-- Email -->
        <v-text-field
          v-model="email"
          label="Email address"
          type="email"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          :rules="emailRules"
          hide-details="auto"
          prepend-inner-icon="mdi-email-outline"
        ></v-text-field>

        <!-- Role Selection -->
        <v-select
          v-model="role"
          :items="roles"
          label="Select System Role"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          :rules="roleRules"
          hide-details="auto"
          prepend-inner-icon="mdi-briefcase-outline"
        ></v-select>

        <!-- Dynamic Department Selection (Only active when role is 'worker') -->
        <v-expand-transition>
          <div v-if="role === 'worker'">
            <v-select
              v-model="department"
              :items="departments"
              label="Select Department"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              :rules="departmentRules"
              hide-details="auto"
              prepend-inner-icon="mdi-domain"
            ></v-select>
          </div>
        </v-expand-transition>

        <!-- Password -->
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          :rules="passwordRules"
          hide-details="auto"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
        ></v-text-field>

        <!-- Confirm Password -->
        <v-text-field
          v-model="confirmPassword"
          label="Confirm Password"
          :type="showConfirmPassword ? 'text' : 'password'"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          :rules="confirmPasswordRules"
          hide-details="auto"
          prepend-inner-icon="mdi-lock-check-outline"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
        ></v-text-field>

        <!-- Submit Button -->
        <v-btn 
          type="submit"
          variant="flat"
          block
          color="#58111A" 
          rounded="pill" 
          elevation="0"
          class="py-5"
          :disabled="!isFormValid || isLoading"
          :loading="isLoading"
        >
          Create Account
        </v-btn>
      </v-form>

      <!-- Back to Login Link -->
      <div class="text-center mt-4">
        <span class="text-grey-darken-1 text-body-2">Already have an account?</span>
        <router-link to="/" class="text-decoration-none" style="color: #58111A;">
          Sign In
        </router-link>
      </div>
    </v-card>
  </v-main>
</template>
