import { useAuthStore } from '../stores/auth.store.js';
import { computed } from 'vue';
import { useRouter } from 'vue-router';


// A composable for authentication state
export function useAuth() {
    // Access router
    const router = useRouter();

    // Access auth store
    const authStore = useAuthStore();

    // Computed properties to easily check user state
    const currentUser = computed(() => authStore.userInfo);
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const isHR = computed(() => authStore.isHR);
    const isWorker = computed(() => authStore.isWorker);

    // Logout helper
    const handleLogout = async () => {
        await authStore.logout();

        // Typically you would trigger your router push here
        router.push('/');
    };

    return {
        currentUser,
        isAuthenticated,
        isHR,
        isWorker,
        handleLogout
    };
}