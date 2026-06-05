import api from "./axios.js";
import { mockRequests } from '../mocks/requests.mock.js'

//Mock Data Functions
//These helpers only affect browser localStorage.
function getMockRequests() {
  const saved = window.localStorage.getItem('mockRequests')

  if (saved) {
    return JSON.parse(saved)
  }

  window.localStorage.setItem('mockRequests', JSON.stringify(mockRequests))
  return [...mockRequests]
}

function saveMockRequests(requests) {
  window.localStorage.setItem('mockRequests', JSON.stringify(requests))
}

//function of axios api to get all requests
export const getAllRequestsApi = async () => {
  try {
    const response = await api.get('/requests/all')
    const requests = response.data

    // Map snake_case database responses to frontend camelCase
    const mapped = requests.map(r => ({
      id: r.id,
      leaveType: r.leaveType,
      status: r.status,
      startDate: r.startDate,
      endDate: r.endDate,
      reason: r.reason,
      submittedAt: r.submittedAt,
      days: r.days,
      employeeId: r.employee_id, // Map employee_id -> employeeId
      employeeName: r.employee_name, // Map employee_name -> employeeName
      department: r.department
    }))

    return {
      success: true,
      data: mapped
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_REQUESTS === 'true') {
      return {
        success: true,
        data: getMockRequests(),
      }
    }

    throw error
  }
}

//function of axios api to create request
export const createRequestApi = async (data) => {
  try {
    // Map frontend camelCase to backend snake_case schemas
    const backendData = {
      id: Math.floor(Math.random() * 1000000), // Backend requires an ID in body
      employee_name: data.employeeName,
      department: data.department,
      leaveType: data.leaveType,
      status: data.status || 'Pending',
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      reason: data.reason || "",
      submittedAt: data.submittedAt || new Date().toISOString().split('T')[0]
    }

    const response = await api.post('/requests/create', backendData)
    const r = response.data

    return{
      success: true,
      data: {
        id: r.id,
        leaveType: r.leaveType,
        status: r.status,
        startDate: r.startDate,
        endDate: r.endDate,
        reason: r.reason,
        submittedAt: r.submittedAt,
        days: r.days,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        department: r.department
      }
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_REQUESTS === 'true') {
      const requests = getMockRequests()

      const newRequest = {
        id: Date.now(),
        ...data,
        status: data.status || 'Pending',
        submittedAt: data.submittedAt || new Date().toISOString().slice(0, 10),
      }

      requests.push(newRequest)
      saveMockRequests(requests)

      return {
        success: true,
        data: newRequest,
      }
    }

    throw error
  }
}

//function of axios api to update request
export const updateRequestApi = async (id, data) => {
  try {
    const backendData = {
      id: Number(id),
      employee_name: data.employeeName,
      department: data.department,
      leaveType: data.leaveType,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      reason: data.reason || "",
      submittedAt: data.submittedAt
    }

    const response = await api.put(`/requests/edit/${id}`, backendData)
    const r = response.data

    return {
      success: true,
      data: {
        id: r.id,
        leaveType: r.leaveType,
        status: r.status,
        startDate: r.startDate,
        endDate: r.endDate,
        reason: r.reason,
        submittedAt: r.submittedAt,
        days: r.days,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        department: r.department
      }
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_REQUESTS === 'true') {
      const requests = getMockRequests()

      const index = requests.findIndex(r => String(r.id) === String(id))

      if (index === -1) {
        return {
          success: false,
          error: 'Request not found',
        }
      }

      requests[index] = {
        ...requests[index],
        ...data,
      }

      saveMockRequests(requests)

      return {
        success: true,
        data: requests[index],
      }
    }

    throw error
  }
}

//function of axios api to delete request
export const deleteRequestApi = async (id) => {
  try {
    const response = await api.delete(`/requests/delete/${id}`)
    return {
      success: true,
      data: response.data
    }

  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_REQUESTS === 'true') {
      const requests = getMockRequests()
      const filteredRequests = requests.filter(
        r => String(r.id) !== String(id)
      )

      saveMockRequests(filteredRequests)

      return {
        success: true,
      }
    }

    throw error
  }
}
