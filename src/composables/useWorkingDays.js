import { useSettingsStore } from '@/stores/settings.store.js'

// A composable for calculating working days
export function useWorkingDays() {
    const settingsStore = useSettingsStore();

    // Calculates working days between two dates (ignoring Saturday/Sunday)
    const calculateWorkingDays = (startDate, endDate) => {
        if (!startDate || !endDate)
            return 0;

        let start = new Date(startDate);
        let end = new Date(endDate);
        let count = 0;

        const holidayList = settingsStore.holidays || [];

        // Loop through each day
        while (start <= end) {
            const dayOfWeek = start.getUTCDay();

            // Format: YYYY-MM-DD
            const dateStr = start.toISOString().split('T')[0]; 
            
            // 0 = Sunday, 6 = Saturday. 
            // Only count weekdays.
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isPublicHoliday = holidayList.includes(dateStr);
            

            if (!isWeekend && !isPublicHoliday) {
                count++;
            }
            start.setUTCDate(start.getUTCDate() + 1);
        }
        return count;
    };

    // Format a date string into something readable (e.g., "Oct 12, 2026")
    const formatDate = (dateString) => {
        if (!dateString)
            return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    return {
        calculateWorkingDays,
        formatDate
    };
}