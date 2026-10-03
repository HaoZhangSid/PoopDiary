import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Check, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, IconButton, useTheme } from '@/design-system';
import { useFeedbackStore } from '@/state/useFeedbackStore';

type Feedback = NonNullable<ReturnType<typeof useFeedbackStore.getState>['feedback']>;
export function FeedbackHost() {
  const feedback = useFeedbackStore((state) => state.feedback);
  return feedback ? <FeedbackNotice key={feedback.id} feedback={feedback} /> : null;
}

function FeedbackNotice({ feedback }: { feedback: Feedback }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('common');
  const dismiss = useFeedbackStore((state) => state.dismiss);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const timer = setTimeout(dismiss, feedback.action ? 10000 : 2600);
    return () => clearTimeout(timer);
  }, [feedback, dismiss]);
  const pair = theme.colors.feedback[feedback.tone];
  const FeedbackIcon = feedback.tone === 'danger' ? AlertCircle : Check;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: theme.spacing.md, right: theme.spacing.md, bottom: insets.bottom + theme.controls.minimumTouchTarget + theme.spacing.xl + theme.spacing.md }}>
      <View accessibilityLiveRegion="polite" style={{ alignSelf: 'center', maxWidth: theme.controls.contentWidth, backgroundColor: pair.bg, borderRadius: theme.radius.md, padding: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <FeedbackIcon size={theme.controls.icon} color={pair.fg} />
        <AppText variant="label" style={{ flexShrink: 1, color: pair.fg }}>{feedback.message}</AppText>
        {feedback.action && <Button label={feedback.action.label} variant="secondary" loading={busy} onPress={async () => {
          if (busy) return;
          setBusy(true);
          try { await feedback.action?.onPress(); } finally { setBusy(false); }
        }} />}
        <IconButton label={t('close')} icon={X} onPress={dismiss} />
      </View>
    </View>
  );
}
