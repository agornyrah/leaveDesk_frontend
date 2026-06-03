import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRequestsStore } from '../stores/requests.store.js';
import { REQUEST_STATUS } from '../constants/requestStatus.js';


// A composable for filtering and managing leave requests
export function useLeaveRequests() {

    const { allLeaveRequests } = storeToRefs(useRequestsStore());

    // We pass the array from Pinia into this composable
    const pendingRequests = computed(() => {
        return allLeaveRequests.value.filter(req => req.status?.toLowerCase() === 'pending');
    });
    const approvedRequests = computed(() => {
        return allLeaveRequests.value.filter(req => 
            req.status?.toLowerCase() === 'approved' || req.status?.toLowerCase() === 'on leave'
        );
    });
    const rejectedRequests = computed(() => {
        return allLeaveRequests.value.filter(req => req.status?.toLowerCase() === 'rejected');
    });

    // Helper to get Vuetify chip colors dynamically from your constants folder!
    const getStatusColor = (statusName) => {
        if (!statusName) return 'grey';

        // Find the status in your constants array (case-insensitive)
        const foundStatus = REQUEST_STATUS.find(
            (s) => s.name.toLowerCase() === statusName.toLowerCase()
        );

        // Return the color from the constant, or grey if not found
        return foundStatus ? foundStatus.color : 'grey';
    };
    return {
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        getStatusColor
    };
}