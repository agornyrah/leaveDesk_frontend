import { defineStore } from "pinia"
import {
  getallEmployeesApi,
  createEmployeeApi,
  updateEmployeeApi,
  deactivateEmployeeApi,
  activateEmployeeApi,
  permanentlyDeleteEmployeeApi,
} from "../api/employee.api.js"

export const useEmployeeStore = defineStore('employee', {
    state: () => ({
        allEmployees: [],
        isLoading: false,
        error: null
    }),

    getters: {

    },

    actions: {
        //function to get all users or employees
        async getAllEmployees() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await getallEmployeesApi();
                if (response.success) {
                    this.allEmployees = response.data;
                } else {
                    this.error = response.error;
                    return false
                }
                this.isLoading = false;
                return true;
            } catch (error) {
                this.error = error;
                this.isLoading = false;
                return false;
            }
        },

        //function to create a new employee
        async createEmployee(name, email, role, department, password) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await createEmployeeApi(name, email, role, department, password);
                if (response.success) {
                    await this.getAllEmployees();
                    this.error = null;
                } else {
                    this.error = response.error;
                    this.isLoading = false
                    return false
                }
                this.isLoading = false;
                return true;
            } catch (error) {
                this.error = error;
                this.isLoading = false;
                return false;
            }
        },

        //function to update an employee
        async updateEmployee(id, name, email, role, department, password) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await updateEmployeeApi(id, name, email, role, department, password);
                if (response.success) {
                    await this.getAllEmployees();
                    this.error = null;
                } else {
                    this.error = response.error;
                    this.isLoading = false
                    return false
                }
                this.isLoading = false;
                return true;
            } catch (error) {
                this.error = error;
                this.isLoading = false;
                return false;
            }
        },

        //function to deactivate an employee
        async deactivateEmployee(id) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await deactivateEmployeeApi(id);
                if (response.success) {
                    await this.getAllEmployees();
                    this.error = null;
                } else {
                    this.error = response.error;
                    this.isLoading = false
                    return false
                }
                this.isLoading = false;
                return true;
            } catch (error) {
                this.error = error;
                this.isLoading = false;
                return false;
            }
        },

        //function to activate an employee
        async activateEmployee(id) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await activateEmployeeApi(id);
                if (response.success) {
                    await this.getAllEmployees();
                    this.error = null;
                } else {
                    this.error = response.error;
                    this.isLoading = false
                    return false
                }
                this.isLoading = false;
                return true;
            } catch (error) {
                this.error = error;
                this.isLoading = false;
                return false;
            }
        },

        //Function to permanently delete an employee
        async permanentlyDeleteEmployee(id) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await permanentlyDeleteEmployeeApi(id);
                if (response.success) {
                    await this.getAllEmployees();
                    this.error = null;
                } else {
                    this.error = response.error;
                    this.isLoading = false
                    return false
                }
                this.isLoading = false;
                return true;
            } catch (error) {
                this.error = error;
                this.isLoading = false;
                return false;
            }
        }

    },
})