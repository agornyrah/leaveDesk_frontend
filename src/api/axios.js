import axios from "axios";

//Creating an axios instance to connect frontend to backend
const api = axios.create({
    baseURL: "http://localhost:8000",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = window.localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Or whatever format your backend expects
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;