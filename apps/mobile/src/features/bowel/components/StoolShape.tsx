import { AppText, useTheme } from '@/design-system';
import type { BowelRecord } from '@/domain/records';

const shapes = ['●', '◆', '━', '━', '••', '≈', '∿'] as const;

/** Same Bristol glyphs as the Web prototype, rendered with native theme tokens. */
export function StoolShape({ type }: { type: BowelRecord['details']['stoolType'] | undefined }) {
  const theme = useTheme();
  return <AppText variant="pageTitle" style={{ color: theme.colors.entry.bowel.fg, textAlign: 'center' }}>
    {typeof type === 'number' ? shapes[type - 1] : '?'}
  </AppText>;
}
