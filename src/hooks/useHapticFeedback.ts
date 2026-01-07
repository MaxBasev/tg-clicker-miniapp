import { useCallback } from 'react';
import WebApp from '@twa-dev/sdk';

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type NotificationType = 'error' | 'success' | 'warning';

export const useHapticFeedback = () => {
    const impactOccurred = useCallback((style: ImpactStyle) => {
        try {
            WebApp.HapticFeedback.impactOccurred(style);
        } catch {
            // Ignore errors in dev mode or if API is unsupported
            console.log(`[Dev] Haptic Impact: ${style}`);
        }
    }, []);

    const notificationOccurred = useCallback((type: NotificationType) => {
        try {
            WebApp.HapticFeedback.notificationOccurred(type);
        } catch {
            console.log(`[Dev] Haptic Notification: ${type}`);
        }
    }, []);

    const selectionChanged = useCallback(() => {
        try {
            WebApp.HapticFeedback.selectionChanged();
        } catch {
            console.log('[Dev] Haptic Selection Changed');
        }
    }, []);

    return { impactOccurred, notificationOccurred, selectionChanged };
};
