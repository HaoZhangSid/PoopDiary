export default {
  common: {
    appName: 'Poop Diary', today: 'Today', diary: 'Diary', insights: 'Insights', profile: 'Profile', log: 'Log',
    bowel: 'Bowel', food: 'Food', symptom: 'Symptoms', water: 'Water', exercise: 'Exercise', sleep: 'Sleep',
    back: 'Back', close: 'Close', cancel: 'Cancel', save: 'Save', edit: 'Edit', delete: 'Delete', undo: 'Undo',
    loading: 'Loading…', retry: 'Retry', error: 'Something went wrong. Try again.', saved: 'Saved', updated: 'Updated', deleted: 'Deleted', restored: 'Restored',
    startupError: 'Could not open your diary.', empty: 'No entries', previousDay: 'Previous day', nextDay: 'Next day',
    type: 'Type {{type}}', unknown: 'Not sure', time: 'Time', date: 'Date', notes: 'Notes', minutes: 'min', hours: 'h', aiInsightsOn: 'AI insights on',
  },
  home: {
    title: 'Today', quickLog: 'Log a bowel movement', recent: 'Your entries',
    entryCount: '{{count}} entry', entryCount_other: '{{count}} entries', allEntries: 'View diary',
    empty: 'No entries today', bowelCount: '{{count}} bowel movement', bowelCount_other: '{{count}} bowel movements',
    quickTitle: 'Quick log', overview: 'Today at a glance', streak: 'continuous recording', days: 'day', addFirst: 'Add an entry',
    mealsLabel: 'Meals', bowelLabel: 'Bowel', symptomLabel: 'Symptoms', exerciseLabel: 'Exercise', sleepLabel: 'Sleep', times: 'times', entry: 'entry', lastNight: 'last night', waterGoal: '/ 2000 ml',
    greetings: { night: 'Good night', morning: 'Good morning', noon: 'Good afternoon', afternoon: 'Good afternoon', evening: 'Good evening' },
  },
  diary: {
    title: 'Diary', add: 'Add entry', eyebrow: 'YOUR BODY, IN CONTEXT', empty: 'No entries on this day', details: 'Entry',
    deleteTitle: 'Delete this entry?', deleteError: 'Could not delete. Try again.',
    restoreError: 'Could not restore. Try again.', missing: 'Entry not found',
  },
  profile: {
    title: 'Profile', name: 'Name', language: 'Language', appearance: 'Appearance', tracking: 'Tracking', aiAnalysis: 'AI Analysis', reminders: 'Reminders', privacy: 'Data and privacy', aiInsights: 'AI Insights', dailyReminder: 'Daily reminder', weeklyReport: 'Weekly report', dailyTime: 'Every day 20:00', weeklyDay: 'Every Sunday', export: 'Export my data', aiData: 'AI data settings', deleteData: 'Delete my data', editProfile: 'Edit profile', saveProfile: 'Save profile', more: 'More profile actions', food: 'Food', bowel: 'Bowel', symptoms: 'Symptoms', water: 'Water', exercise: 'Exercise', sleep: 'Sleep',
    light: 'Light', dark: 'Dark', system: 'System', components: 'Components',
    localData: 'Records are stored on this device.', settingsError: 'Could not save this setting.',
  },
  components: {
    title: 'Components', buttons: 'Buttons', iconButtons: 'Icon buttons', choices: 'Choices', slider: 'Slider', stepper: 'Stepper',
    sheet: 'Sheet', openSheet: 'Open sheet', longText: 'A longer option label that wraps without hiding its meaning',
    selected: 'Selected', unselected: 'Not selected', loading: 'Saving', disabled: 'Disabled',
    feedback: 'Feedback', showFeedback: 'Show saved feedback', error: 'Could not save', errorDetail: 'Your draft is still here.',
    amount: 'Amount', decrease: 'Decrease', increase: 'Increase',
  },
  insights: {
    title: 'Insights', subtitle: 'Patterns over time', range: 'range', stoolEyebrow: 'BOWEL TYPES', symptomsEyebrow: 'SYMPTOMS', days: 'Days', period: 'past {{range}} day', stoolTitle: 'Bowel types', symptomsTitle: 'Symptoms', type: 'Type {{type}}', tapHint: 'Click on the record to view details', week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], bloating: 'Bloating', pain: 'Abdominal pain', patternEyebrow: 'AI pattern · observation', aiOff: 'AI insights off', patternTitle: 'Possible pattern', openAI: 'Turn on AI insights in Profile.', patternBody: '{{count}} bloating entries in this period.', noData: 'Keep logging to see patterns.', meals: 'meals', collapse: 'Hide details', why: 'Why am I seeing this?', related: 'View related entries', disclaimer: 'This is an observation from your logged data, not a diagnosis.', noRelated: 'No related entries.', consistency: 'Logging rhythm', activeDays: 'active days', report: 'View 14-day report',
  },
  report: {
    title: 'Your 14-day report', eyebrow: '14 DAY REPORT', coverageLabel: 'COVERAGE', coverage: 'Coverage', backToInsights: 'Return to Insights', reviewed: 'Reviewed {{count}} entries', periodLegend: 'Hard · Ideal · Loose', typeLabel: 'Type {{type}}', times: 'times', entry: 'entry', meal: 'meal', stoodOut: 'WHAT STOOD OUT', clearerPicture: 'Keep logging for a clearer picture.', coveragePercent: 'Coverage', ofDays: '/ 14 days', entries: '{{count}} entries', empty: 'No entries in the last 14 days', bowel: 'Bowel', symptoms: 'Symptoms', food: 'Meals', dairy: 'Dairy meals', stool: 'Stool', stoolTitle: 'Stool shape', hard: 'Hard · Type 1–2', ideal: 'Ideal · Type 3–4', loose: 'Loose · Type 5–7', most: 'Most common: Type {{type}} ({{count}})', focus: 'What stood out', focusTitle: 'Your recent patterns', summary: 'Your logged data is ready to review.', notEnough: 'Keep logging for a clearer picture.', aiOff: 'AI insights off', aiDisabled: 'Turn on AI insights in Profile to see observations.', disclaimerTitle: 'Record summary, not a diagnosis', disclaimer: 'For tracking only. This does not represent a medical assessment.',
  },
};
