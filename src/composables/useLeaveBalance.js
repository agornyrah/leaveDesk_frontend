import { useWorkingDays } from './useWorkingDays.js';
import { useSettingsStore } from '@/stores/settings.store.js';

// A composable for calculating leave balance
export function useLeaveBalance() {
    const { calculateWorkingDays } = useWorkingDays();
    const settingsStore = useSettingsStore();

    // Pass in all of an employee's approved requests and their yearly allowance
    const calculateRemainingLeaves = (approvedRequests, leaveType = 'Annual Leave') => {

        // Fall back to settingsStore value instead of a hardcoded number
        let allowance = 0

        if (leaveType === 'Annual Leave') {
            allowance = settingsStore.annualLeaveAllowance
        } else if (leaveType === 'Sick Leave') {
            allowance = settingsStore.sickLeaveAllowance
        } else {
            return 0
        }

        if (!approvedRequests || approvedRequests.length === 0)
            return allowance;

        const filteredRequests = approvedRequests.filter(
            req => req.leaveType?.toLowerCase() === leaveType.toLowerCase()
        );

        // Sum up the working days for all approved requests
        const daysUsed = filteredRequests.reduce((total, request) => {
            return total + calculateWorkingDays(request.startDate, request.endDate);
        }, 0);
        return allowance - daysUsed;
    };
    return {
        calculateRemainingLeaves
    };
}