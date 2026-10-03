export default {
  title: 'How do you feel?', quickTitle: 'How do you feel now?', quickWarning: 'Obvious discomfort', editTitle: 'Edit symptoms', quickFlow: '+ body sensation', editFlow: 'Symptoms · Edit', newFlow: 'Symptoms · Quick log', selectLabel: 'Symptoms', detailsLabel: 'Details', saveLabel: 'Review',
  saveEntry: 'Save symptoms', saveChanges: 'Save changes', saved: 'Symptoms saved', updated: 'Changes saved',
  loading: 'Loading record…', missing: 'Record not found', loadError: 'Records could not be loaded.', saveError: 'Could not save. Try again.',
  retry: 'Retry', back: 'Back', close: 'Close', continue: 'Continue', when: 'When', now: 'Now', fiveAgo: '5 min ago', thirtyAgo: '30 min ago', done: 'Done',
  addDetails: 'Add duration and details', noSymptoms: 'I feel fine', severity: 'Severity', painLevel: 'Pain level', painLocation: 'Pain location', vomiting: 'Vomiting?', yes: 'Yes', no: 'No',
  onset: 'When did it start?', duration: 'How long?', note: 'Note', notePlaceholder: 'Optional',
  onsetOptions: { now: 'Just now', hourAgo: 'About an hour ago', earlier: 'Earlier today', unknown: "Don't know" },
  durationOptions: { under30: '<30 min', thirtyTo60: '30–60 min', oneTo3: '1–3 hours', over3: '3+ hours', unknown: "Don't know" },
  symptoms: { bloating: 'Bloating', pain: 'Abdominal pain', nausea: 'Nausea', heartburn: 'Heartburn', gas: 'More gas', frequency: 'Frequent bowel urges', other: 'Other' },
  severities: { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' },
  locations: { leftUpper: 'Upper left', rightUpper: 'Upper right', middle: 'Middle', leftLower: 'Lower left', rightLower: 'Lower right', whole: 'Whole abdomen' },
  warning: { button: 'I feel seriously unwell', title: 'Get medical help first', modify: 'Back to editing', call: 'Call 112', callError: 'Could not open the phone app. Dial 112 directly.', note: 'This record will not be saved. Poop Diary does not provide diagnoses.', urgent: 'Get medical help now', soon: 'Contact a doctor soon', urgentCopy: 'If you have severe pain, black stool, heavy bleeding, dizziness or chest pain, call 112.', soonCopy: 'Contact a doctor or local medical service.', signs: { breathingOrChestPain: 'Breathing trouble or chest pain', severeOrWorseningPain: 'Severe or worsening pain', dizzyOrFaint: 'Dizzy or feeling faint', persistentVomiting: 'Persistent vomiting or cannot drink', highFever: 'High fever or marked weakness', heavyBleedingOrBlackStool: 'Heavy bleeding or black stool' } },
} as const;
