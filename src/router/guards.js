import { useAuthStore } from "../stores/auth.store.js";

export const requireAuth = (to, from, next) => {
    const authStore = useAuthStore()
    const isHrPath = to.path.startsWith('/hr') || to.path.includes('staff') || to.path.includes('leave-requests') || to.path === '/employee-profile';
    const isWorkerPath = to.path === '/dashboard' || to.path === '/submit-request' || to.path === '/my-requests';

    // If the route requires auth and the user is NOT authenticated
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'Login' }) // Send them to login
    }
    // If they ARE authenticated but try to go to the Login page
    else if (authStore.isAuthenticated) {
        const userRole = authStore.userInfo?.role

        //Direct a user who isnt HR to the user dashboard
        if(isHrPath) {
            if (userRole !== 'hr') return next({ name: 'Dashboard' })
        }

        // Prevent HR from accessing worker paths
        if (isWorkerPath) {
            if (userRole === 'hr') return next({ name: 'StaffOverview' })
        }

        if (to.name === 'Login' || to.name === 'Register' || to.name === 'ForgotPassword') {
            return next(authStore.isHR ? { name: 'StaffOverview' } : { name: 'Dashboard' });
        }

        next()
    }
    else {
        next()
    }
}