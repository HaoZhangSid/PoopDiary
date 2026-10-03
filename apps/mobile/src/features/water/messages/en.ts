export default {
  title: 'Drinks', addTitle: 'Add a drink', editTitle: 'Edit drink',
  chooseDrink: 'Drink', amount: 'Amount', todayTotal: 'Today', goal: '/ 2000 ml',
  save: 'Add {{amount}} ml {{drink}}', saveChanges: 'Save changes', saved: 'Drink saved', updated: 'Changes saved',
  loading: 'Loading drink…', missing: 'Drink not found', loadError: 'Drinks could not be loaded.', saveError: 'Could not save. Try again.',
  custom: 'Custom drink', customPlaceholder: 'Drink name', addCustom: 'Add', clearCustom: 'Cancel',
  moreDrinks: 'More drinks', fewerDrinks: 'Fewer drinks', defaultWater: 'Water is selected',
  beverages: { water: 'Water', coffee: 'Coffee', tea: 'Tea', soda: 'Soft drink', juice: 'Juice', milk: 'Milk', alcohol: 'Alcohol', other: 'Other' },
  presets: { '250': '250 ml', '350': '350 ml', '500': '500 ml', '750': '750 ml' },
  volume: 'Drink volume', min: '100 ml', mid: '500 ml', max: '1000 ml',
  back: 'Back', close: 'Close', retry: 'Retry', edit: 'Edit', delete: 'Delete',
} as const;
