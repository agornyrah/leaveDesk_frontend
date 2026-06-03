<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref(null)

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const isFormValid = ref(true)
const emailSent = ref(false) // Tracks whether the reset email was sent

const emailRules = [
  (value) => !!value || "Email is required",
  (value) => /.+@.+\..+/.test(value) || "E-mail must be valid",
]

async function onSubmit() {
  if (formRef.value) {
    const { valid } = await formRef.value.validate()
    if (!valid) {
      errorMessage.value = "Please enter a valid email address."
      return
    }
  }

  isLoading.value = true
  errorMessage.value = ""

  try {
    // TODO: Replace with actual API call e.g. await authStore.forgotPassword(email.value)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Show success state
    emailSent.value = true

  } catch (error) {
    errorMessage.value = "An error occurred. Please try again."
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
      <div class="d-flex align-center justify-center mb-4">
        <v-avatar color="#F9ECEE" size="40" rounded="lg" class="mr-4">
          <v-icon color="#58111A" size="24">mdi-bag-checked</v-icon>
        </v-avatar>
        <span class="font-weight-bold text-h6 text-grey-darken-4">ARCH - LeaveDesk</span>
      </div>

      <!-- STEP 1: Email Input Form -->
      <template v-if="!emailSent">
        <div class="text-center mb-6">
          <h2 class="text-h6 font-weight-bold">Forgot Password</h2>
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

        <v-form ref="formRef" @submit.prevent="onSubmit" v-model="isFormValid">
          <v-text-field
            v-model="email"
            label="Email address"
            type="email"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="emailRules"
            hide-details="auto"
            prepend-inner-icon="mdi-email-outline"
          ></v-text-field>

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
            Send Reset Link
          </v-btn>
        </v-form>
      </template>

      <!-- STEP 2: Success Confirmation -->
      <template v-else>
        <div class="text-center">
          <v-icon color="#58111A" size="64" class="mb-4">mdi-email-check-outline</v-icon>
          <h2 class="text-h6 font-weight-bold mb-2">Check your email</h2>
          <p class="text-body-2 text-grey-darken-1 mb-6">
            We've sent a password reset link to <strong>{{ email }}</strong>. 
            Please check your inbox and follow the instructions.
          </p>

          <v-btn 
            variant="flat"
            block
            color="#58111A" 
            rounded="pill" 
            elevation="0"
            class="py-5"
            @click="router.push('/')"
          >
            Back to Sign In
          </v-btn>
        </div>
      </template>

      <!-- Back to Login Link -->
      <div v-if="!emailSent" class="text-center mt-4">
        <router-link to="/" class="text-decoration-none text-body-2" style="color: #58111A;">
          ← Back to Sign In
        </router-link>
      </div>
    </v-card>
  </v-main>
</template>
