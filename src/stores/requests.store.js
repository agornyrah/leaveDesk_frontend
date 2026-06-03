import { defineStore } from 'pinia'
import { getAllRequestsApi, createRequestApi, updateRequestApi, deleteRequestApi } from "../api/requests.api.js"

export const useRequestsStore = defineStore('requests', {
    state: () => ({
        // Read from local storage
        allLeaveRequests: [],
        isLoading: false,
        error: null
    }),

    getters: {

    },

    actions: {
        //function to get all requests
        async getAllRequests() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await getAllRequestsApi();
                if (response.success) {
                    this.allLeaveRequests = response.data;
                } else {
                    this.error = response.error;
                    return false
                }
                this.isLoading = false;
                return true;
            } catch (error) {
                console.error(error);
                this.error = error;
                this.isLoading = false;
                return false;
            }
        },

        //function to create a request
        async createRequest(data) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await createRequestApi(data);
                if (response.success) {
                    // Pulls the updated list immediately
                    await this.getAllRequests();
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

        // function to update a request
        async updateRequest(id, data) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await updateRequestApi(id, data);
                if (response.success) {
                    // Pulls the updated list immediately
                    await this.getAllRequests();
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

        // function to delete a request
        async deleteRequest(id) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await deleteRequestApi(id);
                if (response.success) {
                    // Pulls the updated list immediately
                    await this.getAllRequests();
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
