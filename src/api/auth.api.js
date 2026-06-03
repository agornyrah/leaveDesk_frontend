import api from "./axios.js";
import { mockUsers } from '../mocks/auth.mock.js'
import { mockEmployees } from '../mocks/employees.mock.js'

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

// Helper to fetch the logged-in user profile using the JWT token
export const getAuthUserApi = async () => {
  const response = await api.get('/employee/auth')
  return response.data
}

// function of axios api to login a user
export const loginApi = async (email, password) => {
  try {
    const response = await api.post('/employee/login', { email, password })
    return response.data
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      const users = getMockUsers()

      const user = users.find(
        u => u.email === email && u.password === password
      )

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password',
        }
      }

      if (user.status?.toLowerCase() === 'inactive') {
        return {
          success: false,
          error: 'This account is inactive. Contact HR.',
        }
      }

      const { password: _password, ...userInfo } = user

      return {
        success: true,
        token: 'mock-token',
        userInfo,
      }
    }

    throw error
  }
}

// function of axios api to register a user
export const registerApi = async (name, email, role, department, password) => {
  try {
    const response = await api.post('/employee/register', {
      employee_id: Math.floor(100000 + Math.random() * 900000), // Backend requires an integer ID
      name,
      email,
      role,
      department: role === 'worker' ? department : "",
      status: 'Active', // Backend requires a status value
      hash_password: password, // Backend expects hash_password in schema
    })

    return response.data
  } catch (error) {
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      const users = getMockUsers()

      const existingUser = users.find(u => u.email === email)

      if (existingUser) {
        return {
          success: false,
          error: 'Email already exists',
        }
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

      users.push(newUser)
      saveMockUsers(users)

      if (role === 'worker') {
        const savedEmployees = window.localStorage.getItem('mockEmployees')
        const employees = savedEmployees ? JSON.parse(savedEmployees) : [...mockEmployees]

        employees.push({
          id: newUser.id,
          name,
          email,
          role,
          department,
          status: 'Active',
        })

        window.localStorage.setItem('mockEmployees', JSON.stringify(employees))
      }

      const { password: _password, ...userInfo } = newUser

      return {
        success: true,
        userInfo,
      }
    }

    throw error
  }
}
