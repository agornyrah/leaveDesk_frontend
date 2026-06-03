import { defineStore } from 'pinia'
import { getSettingsApi, updateSettingsApi } from '../api/settings.api.js'

export const useSettingsStore = defineStore('settings', {
state: () => ({
  annualLeaveAllowance: 25,
  sickLeaveAllowance: 10,
  carryOverEnabled: true,
  maxCarryOverDays: 5,

  emailNotifications: true,
  notifyOnSubmit: true,
  notifyOnApproval: true,

  holidays: [],

  isLoading: false,
  error: null,
}),
  
  actions: {
    //Get settings
    async getSettings() {
      this.isLoading = true
      this.error = null

      try {
        const response = await getSettingsApi()

        if (response.success) {
          Object.assign(this, response.data)
          this.isLoading = false
          return true
        }

        this.error = response.error
        this.isLoading = false
        return false
      } catch (error) {
        this.error = error
        this.isLoading = false
        return false
      }
    },

    //Save settings
    async saveSettings(settings) {
      this.isLoading = true
      this.error = null

      try {
        const response = await updateSettingsApi(settings)

        if (response.success) {
          Object.assign(this, response.data)
          this.isLoading = false
          return true
        }

        this.error = response.error
        this.isLoading = false
        return false
      } catch (error) {
        this.error = error
        this.isLoading = false
        return false
      }
    },

    // Action to add a holiday
    async addHoliday(dateStr) {
      if (!dateStr || this.holidays.includes(dateStr)) return false

      const updatedSettings = {
        annualLeaveAllowance: this.annualLeaveAllowance,
        sickLeaveAllowance: this.sickLeaveAllowance,
        carryOverEnabled: this.carryOverEnabled,
        maxCarryOverDays: this.maxCarryOverDays,
        emailNotifications: this.emailNotifications,
        notifyOnSubmit: this.notifyOnSubmit,
        notifyOnApproval: this.notifyOnApproval,
        holidays: [...this.holidays, dateStr].sort(),
      }

      return await this.saveSettings(updatedSettings)
    },

    // Action to remove a holiday
    async removeHoliday(dateStr) {
      const updatedSettings = {
        annualLeaveAllowance: this.annualLeaveAllowance,
        sickLeaveAllowance: this.sickLeaveAllowance,
        carryOverEnabled: this.carryOverEnabled,
        maxCarryOverDays: this.maxCarryOverDays,
        emailNotifications: this.emailNotifications,
        notifyOnSubmit: this.notifyOnSubmit,
        notifyOnApproval: this.notifyOnApproval,
        holidays: this.holidays.filter(date => date !== dateStr),
      }

      return await this.saveSettings(updatedSettings)
    }
  }
})