<script setup>
import { ref, onMounted } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import { useSettingsStore } from '@/stores/settings.store.js'

const settingsStore = useSettingsStore()

// Bind form inputs to local reactive variables
const annualLeaveAllowance = ref(15)
const sickLeaveAllowance = ref(5)
const carryOverEnabled = ref(true)
const maxCarryOverDays = ref(5)

const emailNotifications = ref(true)
const notifyOnSubmit = ref(true)
const notifyOnApproval = ref(true)

const saveLoading = ref(false)
const saveSuccess = ref(false)

// Local input state for the datepicker input
const newHolidayDate = ref('')

async function addNewHoliday() {
  if (newHolidayDate.value) {
    await settingsStore.addHoliday(newHolidayDate.value)
    newHolidayDate.value = ''
  }
}

// Prefill form states on mount
onMounted(async () => {
  await settingsStore.getSettings()

  annualLeaveAllowance.value = settingsStore.annualLeaveAllowance
  sickLeaveAllowance.value = settingsStore.sickLeaveAllowance
  carryOverEnabled.value = settingsStore.carryOverEnabled
  maxCarryOverDays.value = settingsStore.maxCarryOverDays
  
  emailNotifications.value = settingsStore.emailNotifications
  notifyOnSubmit.value = settingsStore.notifyOnSubmit
  notifyOnApproval.value = settingsStore.notifyOnApproval
})

async function onSave() {
  saveLoading.value = true
  saveSuccess.value = false
  
  try {
    // Save to the Pinia store with local persistence
    await settingsStore.saveSettings({
      annualLeaveAllowance: annualLeaveAllowance.value,
      sickLeaveAllowance: sickLeaveAllowance.value,
      carryOverEnabled: carryOverEnabled.value,
      maxCarryOverDays: maxCarryOverDays.value,
      emailNotifications: emailNotifications.value,
      notifyOnSubmit: notifyOnSubmit.value,
      notifyOnApproval: notifyOnApproval.value,

      holidays: settingsStore.holidays
    })
    
    // Aesthetic delay for UI realism
    await new Promise((r) => setTimeout(r, 600))
    saveSuccess.value = true
    setTimeout(() => (saveSuccess.value = false), 3000)
  } catch (err) {
    console.error('Failed to save settings:', err)
  } finally {
    saveLoading.value = false
  }
}
</script>

<template>
  <AppShell>
    <div style="max-width: 1000px;margin: 0 auto; padding: 0 16px;">
      
      <!-- Header Area -->
      <v-row class="d-flex mb-2 align-center justify-space-between">
        <v-col cols="12" class="d-flex justify-start">
          <h1
            class="font-weight-bold text-display-medium"
            style="letter-spacing: 0.5px; color: #58111A !important;"
          >
            HR Settings
          </h1>
        </v-col>
      </v-row>

      <!-- Success Notification Alert -->
      <v-alert
        v-if="saveSuccess"
        type="success"
        variant="tonal"
        color="#58111A"
        class="mb-5 font-weight-bold"
        density="comfortable"
        prepend-icon="mdi-check-circle-outline"
      >
        Settings saved successfully.
      </v-alert>

      <!-- Leave Policy Card (using native borders and border-color override) -->
      <v-card 
        class="pa-5 border-sm mb-5" 
        style="border-color: rgba(88, 17, 26, 0.12) !important;" 
        variant="flat" 
        color="white"
      >
        <div class="font-weight-bold mb-5 d-flex align-center" style="color: #58111A; letter-spacing: 0.5px; font-size: 1.6rem;">
          <v-icon class="mr-2" color="#58111A">mdi-folder-cog-outline</v-icon>
          Leave Policy Configuration
        </div>

        <v-row>
          <v-col cols="12" sm="6">
            <div class="font-weight-bold mb-2">
              Annual Leave Allowance (Days/Year)
            </div>
            <v-text-field
              v-model.number="annualLeaveAllowance"
              type="number"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
              min="1"
              max="60"
              style="color: #58111A;"
              prepend-inner-icon="mdi-calendar-month-outline"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <div class="font-weight-medium mb-2">
              Sick Leave Allowance (Days/Year)
            </div>
            <v-text-field
              v-model.number="sickLeaveAllowance"
              type="number"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
              min="1"
              max="60"
              style="color: #58111A;"
              prepend-inner-icon="mdi-medical-bag"
            />
          </v-col>
        </v-row>

        <v-divider class="my-6 border-opacity-25" color="#58111A" />

        <div class="d-flex align-center justify-space-between mb-3">
          <div>
            <div class="font-weight-medium">Allow Carry-Over</div>
            <div class="text-grey-darken-1">
              Let employees carry unused annual leave days into the next fiscal year.
            </div>
          </div>
          <v-switch
            v-model="carryOverEnabled"
            color="#58111A"
            hide-details
            density="compact"
          />
        </div>

        <v-expand-transition>
          <div v-if="carryOverEnabled" class="mt-4">
            <div class="font-weight-medium mb-2">
              Maximum Carry-Over Limit (Days)
            </div>
            <v-text-field
              v-model.number="maxCarryOverDays"
              type="number"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
              min="1"
              max="30"
              style="color: #58111A; max-width: 240px;"
              prepend-inner-icon="mdi-calendar-arrow-right"
            />
          </div>
        </v-expand-transition>
      </v-card>

      <!-- Notifications Card -->
      <v-card 
        class="pa-5 border-sm mb-6" 
        style="border-color: rgba(88, 17, 26, 0.12) !important;" 
        variant="flat" 
        color="white"
      >
        <div class="font-weight-bold mb-5 d-flex align-center" style="color: #58111A; letter-spacing: 0.5px; font-size: 1.6rem;">
          <v-icon class="mr-2" color="#58111A">mdi-bell-ring-outline</v-icon>
          Notification Preferences
        </div>

        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <div class="font-weight-medium">Email Alerts</div>
            <div class="text-grey-darken-1">Send immediate email notifications for leave activity.</div>
          </div>
          <v-switch
            v-model="emailNotifications"
            color="#58111A"
            hide-details
            density="compact"
          />
        </div>

        <v-expand-transition>
          <!-- Using native Vuetify start-border (s-border) for clean left line -->
          <div 
            v-if="emailNotifications" 
            class="ps-4 ms-1 border-s-md" 
            style="border-color: rgba(88, 17, 26, 0.2) !important;"
          >
            <div class="d-flex align-center justify-space-between mb-3 py-1">
              <div class="font-weight-medium">Notify HR when a request is submitted</div>
              <v-switch
                v-model="notifyOnSubmit"
                color="#58111A"
                hide-details
                density="compact"
              />
            </div>
            <div class="d-flex align-center justify-space-between py-1">
              <div class="font-weight-medium">Notify worker when request status changes</div>
              <v-switch
                v-model="notifyOnApproval"
                color="#58111A"
                hide-details
                density="compact"
              />
            </div>
          </div>
        </v-expand-transition>
      </v-card>

      <!-- Public Holidays Config Card -->
      <v-card 
        class="pa-5 border-sm mb-6" 
        style="border-color: rgba(88, 17, 26, 0.12) !important;" 
        variant="flat" 
        color="white"
      >
        <div class="font-weight-bold mb-5 d-flex align-center" style="color: #58111A; letter-spacing: 0.5px; font-size: 1.6rem;">
          <v-icon class="mr-2" color="#58111A">mdi-calendar-star</v-icon>
          Public Holidays Configuration
        </div>

        <v-row class="align-center mb-6">
          <v-col cols="12" sm="8">
            <div class="font-weight-medium mb-2">Register Upcoming Public Holiday</div>
            <v-text-field
              v-model="newHolidayDate"
              type="date"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
              style="color: #58111A;"
            />
          </v-col>
          <v-col cols="12" sm="4" class="d-flex align-end mt-4 mt-sm-8">
            <v-btn
              color="#58111A"
              variant="tonal"
              class="font-weight-bold px-6"
              prepend-icon="mdi-plus"
              height="44"
              block
              @click="addNewHoliday"
            >
              Add Holiday
            </v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-4 border-opacity-25" color="#58111A" />

        <div class="font-weight-medium mb-3">Configured Holidays (Skipped in Leave calculations)</div>
        
        <!-- Empty state if no holidays added -->
        <div v-if="settingsStore.holidays.length === 0" class="text-caption text-grey-darken-1 py-2">
          No public holiday dates configured yet.
        </div>

        <!-- Holiday Chips list -->
        <div class="d-flex ga-2 flex-wrap">
          <v-chip
            v-for="holiday in settingsStore.holidays"
            :key= "holiday"
            closable
            color="#58111A"
            variant="tonal"
            class="font-weight-medium"
            @click:close="settingsStore.removeHoliday(holiday)"
          >
            <v-icon start size="16">mdi-calendar-range</v-icon>
            {{ new Date(holiday).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) }}
          </v-chip>
        </div>
      </v-card>

      <!-- Save Button Panel -->
      <div class="d-flex justify-end mb-6">
        <v-btn
          variant="flat"
          rounded="lg"
          color="#58111A"
          class="text-capitalize font-weight-bold px-8"
          height="46"
          :loading="saveLoading"
          prepend-icon="mdi-content-save-outline"
          @click="onSave"
        >
          Save Changes
        </v-btn>
      </div>
    </div>
  </AppShell>
</template>