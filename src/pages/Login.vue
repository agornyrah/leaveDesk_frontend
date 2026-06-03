<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store.js'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const isFormValid = ref(true)

const emailRules = [
  (value) => !!value || "Email is required",
  (value) => /.+@.+\..+/.test(value) || "E-mail must be valid",
]

const passwordRules = [
  (value) => !!value || "Password is required",
  (value) => value.length >= 6 || "Password must be at least 6 characters",
]

async function onSubmit() {
  // Trigger Vuetify's built-in validation rules programmatically
  if (formRef.value) {
    const { valid } = await formRef.value.validate()
    if (!valid) {
      errorMessage.value = "Please enter both email and password."
      return
    }
  }
  
  isLoading.value = true
  errorMessage.value = ""
  
  try {
    // Call login method from auth store
    const success = await authStore.login(email.value, password.value)
    
    if (success) {
      // Redirect based on role using Pinia getters
      if (authStore.isHR) {
        router.push('/staff-overview')
      } else if (authStore.isWorker) {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } else {
      errorMessage.value = "Invalid credentials. Please try again."
    }
  } catch (error) {
    errorMessage.value = "An error occurred connecting to the server."
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <v-main class="d-flex align-center justify-center bg-grey-lighten-4">
    <v-card 
        class="pa-8 mx-auto" 
        width="100%"
        max-width="420"
        elevation="0"
        style="border: 0.5px solid #58111A; border-radius: 2px;"
      >
          <!-- Logo Section -->
          <div class="d-flex align-center mb-6">
          <v-avatar color="#F9ECEE" size="40" rounded="lg" class="mr-4">
            <v-icon color="#58111A" size="33">mdi-bag-checked</v-icon>
          </v-avatar>
          <span class="font-weight-bold">ARCH - LeaveDesk</span>
        </div>

          <!-- Error Alert -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mb-4"
            density="compact"
          >
            {{ errorMessage }}
          </v-alert>

          <!-- Login Form -->
          <v-form ref="formRef" @submit.prevent="onSubmit" v-model="isFormValid">
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

            <!-- Remember me & Forgot password -->
            <div class="d-flex flex-column align-end mb-3">
              <router-link to="/forgot-password" class="text-decoration-none text-error">
                Forgot password?
              </router-link>
            </div>

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
              Sign In
            </v-btn>
          </v-form>

          <!-- Create account link -->
          <div class="text-center mt-4">
            <span class="text-grey-darken-1">Don't have an account?</span>
            <router-link to="/register" class="text-decoration-none text-error ms-1">
              Create account
            </router-link>
          </div>
    </v-card>
  </v-main>
</template>