import api from './axios.js'
import { mockSettings } from '../mocks/settings.mock.js'

//Mock Data Functions
//These helpers only affect browser localStorage.
function getMockSettings() {
  const saved = window.localStorage.getItem('mockSettings')

  if (saved) {
    return JSON.parse(saved)
  }

  window.localStorage.setItem('mockSettings', JSON.stringify(mockSettings))
  return { ...mockSettings }
}

function saveMockSettings(settings) {
  window.localStorage.setItem('mockSettings', JSON.stringify(settings))
}

//Function to get settings
export const getSettingsApi = async () => {
  try {
    const response = await api.get('/settings/current')
    const settings = response.data //Directly access the object

    const fallbackSettings = settings || {
      annualLeaveAllowance: 25,
      sickLeaveAllowance: 10,
      carryOverEnabled: true,
      maxCarryOverDays: 5,
      emailNotifications: true,
      notifyOnSubmit: true,
      notifyOnApproval: true,
      holidays: "[]"
    }

    return {
      success: true,
      data: {
        ...fallbackSettings,
        holidays: Array.isArray(fallbackSettings.holidays)
          ? fallbackSettings.holidays
          : JSON.parse(fallbackSettings.holidays || "[]"),
      },
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_SETTINGS === 'true') {
      return {
        success: true,
        data: getMockSettings(),
      }
    }

    throw error
  }
}

//Function to update settings
export const updateSettingsApi = async (settings) => {
  try {
    const backendData = {
      setting_id: 1,
      annualLeaveAllowance: settings.annualLeaveAllowance,
      sickLeaveAllowance: settings.sickLeaveAllowance,
      carryOverEnabled: settings.carryOverEnabled,
      maxCarryOverDays: settings.maxCarryOverDays,
      emailNotifications: settings.emailNotifications,
      notifyOnSubmit: settings.notifyOnSubmit,
      notifyOnApproval: settings.notifyOnApproval,
      holidays: JSON.stringify(settings.holidays || []) // Stringify holidays array for DB
    }

    const response = await api.post('/settings/save', backendData)

    return{
      success: true,
      data: {
        ...settings,
        holidays: Array.isArray(settings.holidays)
          ? settings.holidays
          : JSON.parse(settings.holidays || "[]"),
      },
    }

  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_SETTINGS === 'true') {
      saveMockSettings(settings)

      return {
        success: true,
        data: settings,
      }
    }

    throw error
  }
}