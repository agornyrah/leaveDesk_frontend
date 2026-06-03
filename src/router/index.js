import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth } from "./guards.js"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: "Login",
      component: () => import('@/pages/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: "Register",
      component: () => import('@/pages/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/forgot-password',
      name: "ForgotPassword",
      component: () => import('@/pages/ForgotPassword.vue'),
      meta: { requiresAuth: false }
    },

    //Catch-all route for 404s
    {
      path: '/:pathMatch(.*)*',
      name: "NotFound",
      component: () => import('@/pages/NotFound.vue'),
    },

    //THE WORKER ROUTES
    {
      path: '/dashboard',
      name: "Dashboard",

      //Implementing lazy loading
      component: () => import('@/pages/worker/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-requests',
      name: "MyRequests",

      //Implementing lazy loading
      component: () => import('@/pages/worker/MyRequests.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/submit-request',
      name: "SubmitRequest",

      //Implementing lazy loading
      component: () => import('@/pages/worker/SubmitRequest.vue'),
      meta: { requiresAuth: true }
    },

    //THE HR ROUTES
    {
      path: '/staff-overview',
      name: "StaffOverview",

      //Implementing lazy loading
      component: () => import('@/pages/hr/StaffOverview.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/employee-profile',
      name: "EmployeeProfile",

      //Implementing lazy loading
      component: () => import('@/pages/hr/EmployeeProfile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/leave-requests',
      name: "LeaveRequests",

      //Implementing lazy loading
      component: () => import('@/pages/hr/LeaveRequests.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/hr/settings',
      name: "Settings",

      //Implementing lazy loading
      component: () => import('@/pages/hr/Settings.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

// Attach the guard to the router
router.beforeEach(requireAuth)

export default router