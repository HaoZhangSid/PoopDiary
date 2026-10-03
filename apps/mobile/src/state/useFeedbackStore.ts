import { create } from 'zustand';
import { AccessibilityInfo, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

type FeedbackAction = { label: string; onPress: () => void | Promise<void> };
type Feedback = { id: number; message: string; action?: FeedbackAction; tone: 'success' | 'danger' };
type FeedbackState = {
  feedback: Feedback | null;
  show: (message: string, action?: FeedbackAction, tone?: 'success' | 'danger') => void;
  dismiss: () => void;
};

let sequence = 0;
export const useFeedbackStore = create<FeedbackState>((set) => ({
  feedback: null,
  show: (message, action, tone = 'success') => {
    set({ feedback: { id: ++sequence, message, action, tone } });
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(message);
      void Haptics.notificationAsync(tone === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    }
  },
  dismiss: () => set({ feedback: null }),
}));
