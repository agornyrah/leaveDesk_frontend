import api from "./axios.js";
import { mockEmployees } from '../mocks/employees.mock.js'
import { mockUsers } from '../mocks/auth.mock.js'

//Mock Data Functions
//These helpers only affect browser localStorage.
function getMockUsers() {
  const saved = window.localStorage.getItem('mockUsers')

  if (saved) {
    return JSON.parse(saved)
  }

  window.localStorage.setItem('mockUsers', JSON.stringify(mockUsers))
  return [...mockUsers]
}

function saveMockUsers(users) {
  window.localStorage.setItem('mockUsers', JSON.stringify(users))
}

//Mock Data Functions
//These helpers only affect browser localStorage.
function getMockEmployees() {
  const saved = window.localStorage.getItem('mockEmployees')

  if (saved) {
    return JSON.parse(saved)
  }

  window.localStorage.setItem('mockEmployees', JSON.stringify(mockEmployees))
  return [...mockEmployees]
}

function saveMockEmployees(employees) {
  window.localStorage.setItem('mockEmployees', JSON.stringify(employees))
}

//function of axios api to get data
export const getallEmployeesApi = async () => {
  try {
    const response = await api.get('/employee/all')
    const employees = response.data

    const mapped = employees.map(e => ({
      id: e.employee_id, // Map employee_id -> id
      name: e.name,
      email: e.email,
      role: e.role,
      department: e.department,
      status: e.status
    }))

    return {
      success: true,
      data: mapped,
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_EMPLOYEES === 'true') {
      return {
        success: true,
        data: getMockEmployees(),
      }
    }

    throw error
  }
}

//function of axios api to create a employee
export const createEmployeeApi = async (name, email, role, department, password) => {
  try {
    const response = await api.post('/employee/register', {
      employee_id: Math.floor(100000 + Math.random() * 900000),
      name,
      email,
      role,
      department: role === 'worker' ? department : "",
      status: 'Active',
      hash_password: password || "Password123"
    })

    const e = response.data

    return {
      success: true,
      data: {
        id: e.employee_id,
        name: e.name,
        email: e.email,
        role: e.role,
        department: e.department,
        status: e.status
      }
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_EMPLOYEES === 'true') {
      const employees = getMockEmployees()
      const users = getMockUsers()

      const existingEmployee = employees.find(e => e.email === email)
      const existingUser = users.find(u => u.email === email)

      if (existingEmployee || existingUser) {
        return {
          success: false,
          error: 'Employee or user with this email already exists',
        }
      }

      const newEmployee = {
        id: Date.now(),
        name,
        email,
        role,
        department,
        status: 'Active',
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role,
        department,
        status: 'Active',
      }

      employees.push(newEmployee)
      saveMockEmployees(employees)

      users.push(newUser)
      saveMockUsers(users)

      return {
        success: true,
        data: newEmployee,
      }
    }

    throw error
  }
}

//function of axios api to update data
export const updateEmployeeApi = async (id, name, email, role, department, password) => {
  try {
    const response = await api.put(`/employee/edit/${id}`, {
      employee_id: Number(id),
      name,
      email,
      role,
      department: role === 'worker' ? department : "",
      status: 'Active',
      hash_password: password
    })

    const e = response.data

    return {
      success: true,
      data: {
        id: e.employee_id,
        name: e.name,
        email: e.email,
        role: e.role,
        department: e.department,
        status: e.status,
        hash_password: e.password
      }
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_EMPLOYEES === 'true') {
      const employees = getMockEmployees()

      const index = employees.findIndex(e => String(e.id) === String(id))

      if (index === -1) {
        return {
          success: false,
          error: 'Employee not found',
        }
      }

      employees[index] = {
        ...employees[index],
        name,
        email,
        role,
        department,
      }

      saveMockEmployees(employees)

      return {
        success: true,
        data: employees[index],
      }
    }

    throw error
  }
}

//function of axios api to delete data
export const deactivateEmployeeApi = async (id) => {
  try {
    const response = await api.patch(`/employee/deactivate/${id}`)
    const e = response.data

    return {
      success: true,
      data: {
        id: e.employee_id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        department: response.data.department,
        status: response.data.status,
      }
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_EMPLOYEES === 'true') {
      const employees = getMockEmployees()
      const users = getMockUsers()

      const employeeIndex = employees.findIndex(
        e => String(e.id) === String(id)
      )

      if (employeeIndex === -1) {
        return {
          success: false,
          error: 'Employee not found',
        }
      }

      employees[employeeIndex] = {
        ...employees[employeeIndex],
        status: 'Inactive',
      }

      const userIndex = users.findIndex(
        u => String(u.id) === String(id)
      )

      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          status: 'Inactive',
        }
      }

      saveMockEmployees(employees)
      saveMockUsers(users)

      return {
        success: true,
        data: employees[employeeIndex],
      }
    }
    
    throw error
  }
}

//function of axios api to activate employee
export const activateEmployeeApi = async (id) => {
  try {
    const response = await api.patch(`/employee/activate/${id}`)
    const e = response.data

    return {
      success: true,
      data: {
        id: e.employee_id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        department: response.data.department,
        status: response.data.status,
      }
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_EMPLOYEES === 'true') {
      const employees = getMockEmployees()
      const users = getMockUsers()

      const employeeIndex = employees.findIndex(
        e => String(e.id) === String(id)
      )

      if (employeeIndex === -1) {
        return {
          success: false,
          error: 'Employee not found',
        }
      }

      employees[employeeIndex] = {
        ...employees[employeeIndex],
        status: 'Inactive',
      }

      const userIndex = users.findIndex(
        u => String(u.id) === String(id)
      )

      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          status: 'Inactive',
        }
      }

      saveMockEmployees(employees)
      saveMockUsers(users)

      return {
        success: true,
        data: employees[employeeIndex],
      }
    }
    
    throw error
  }
}

//Function to permanently delete employee (mock only)
export const permanentlyDeleteEmployeeApi = async (id) => {
  try {
    const response = await api.delete(`/employee/delete/${id}`)
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_EMPLOYEES === 'true') {
      const employees = getMockEmployees()
      const users = getMockUsers()

      const filteredEmployees = employees.filter(
        e => String(e.id) !== String(id)
      )

      const filteredUsers = users.filter(
        u => String(u.id) !== String(id)
      )

      saveMockEmployees(filteredEmployees)
      saveMockUsers(filteredUsers)

      return {
        success: true,
      }
    }

    throw error
  }
}

