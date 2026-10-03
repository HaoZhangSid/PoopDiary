import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Screen } from '@/design-system';
import { localDateKey } from '@/domain/records';
import { useAppStore } from '@/state/useAppStore';
import { RecordCard } from '@/features/diary';
import { displayDate } from '@/i18n/recordPresentation';

export function HomeScreen() {
  const { t, i18n } = useTranslation('home');
  const records = useAppStore((state) => state.records);
  const [today, setToday] = useState(() => localDateKey(new Date()));
  useEffect(() => { const timer = setInterval(() => setToday(localDateKey(new Date())), 60000); return () => clearInterval(timer); }, []);
  const entries = records.filter((record) => record.localDate === today).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  return <Screen title={t('title')} subtitle={displayDate(today, i18n.language, true)}>
    <Button label={t('quickLog')} icon={Plus} onPress={() => router.push('/bowel')} />
    <Card><AppText variant="sectionTitle">{t('bowelCount', { count: entries.filter((record) => record.kind === 'bowel').length })}</AppText><AppText tone="secondary">{t('entryCount', { count: entries.length })}</AppText></Card>
    <AppText variant="sectionTitle" accessibilityRole="header">{t('recent')}</AppText>
    {!entries.length && <AppText tone="secondary">{t('empty')}</AppText>}
    {entries.slice(0, 5).map((record) => <RecordCard key={record.id} record={record} onPress={() => router.push({ pathname: '/diary', params: { entry: record.id } })} />)}
    <Button variant="secondary" label={t('allEntries')} onPress={() => router.push('/diary')} />
  </Screen>;
}
