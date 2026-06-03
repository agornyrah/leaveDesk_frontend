import { defineStore } from 'pinia'
import { loginApi, registerApi, getAuthUserApi } from "../api/auth.api.js"

export const useAuthStore = defineStore('auth', {
    state: () => ({
        // Read from local storage
        token: window.localStorage.getItem("token") || "",

        userInfo: JSON.parse(window.localStorage.getItem("userInfo")) || {
            id: 0,
            name: "",
            email: "",
            role: "",
            department: ""
        },

        // True if token exists, false otherwise
        isAuthenticated: !!window.localStorage.getItem("token")
    }),

    getters: {
        isWorker: (state) => state.userInfo.role === "worker",
        isHR: (state) => state.userInfo.role === "hr",
    },

    actions: {
        //function to login a user
        async login(email, password) {
            try {
                const re = await loginApi(email, password)
                const token = re["Employee Token"]

                if (token) {
                    //Set the token
                    this.token = token
                    //State persistence
                    window.localStorage.setItem("token", token);

                    //Fetch the userinfo using the token
                    const profile = await getAuthUserApi()
                    
                    //Set the user info
                    this.userInfo = {
                        id: profile.employee_id,
                        name: profile.name,
                        email: profile.email,
                        role: profile.role,
                        department: profile.department
                    }
                    //Set authentication status
                    this.isAuthenticated = true
                    //State persistence
                    window.localStorage.setItem("userInfo", JSON.stringify(this.userInfo));
                    return true
                } else {
                    this.isAuthenticated = false
                    return false
                }
            } catch (err) {
                this.isAuthenticated = false
                return false
            }
        },

        //function to register a user
        async register(name, email, role, department, password) {
            try {
                const re = await registerApi(name, email, role, department, password)
                if (re) {
                    //Set the user info
                    this.userInfo = {
                        id: re.employee_id,
                        name: re.name,
                        email: re.email,
                        role: re.role,
                        department: re.department
                    }
                    //State persistence
                    window.localStorage.setItem("userInfo", JSON.stringify(this.userInfo));
                    return true
                } else {
                    return false
                }
            } catch (err) {
                console.error("Store error during registration:", err);
                return false
            }
        },

        // function to logout a user
        async logout() {
            //Clear local storage
            window.localStorage.removeItem("token");
            window.localStorage.removeItem("userInfo");

            //Reset state
            this.token = ""
            this.userInfo = {
                id: 0,
                name: "",
                email: "",
                role: "",
                department: ""
            }
            this.isAuthenticated = false

        }
    },
})
