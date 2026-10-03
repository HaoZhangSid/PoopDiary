export default {
  title: 'Juomat', addTitle: 'Lisää juoma', editTitle: 'Muokkaa juomaa',
  chooseDrink: 'Juoma', amount: 'Määrä', todayTotal: 'Tänään', goal: '/ 2000 ml',
  save: 'Lisää {{amount}} ml {{drink}}', saveChanges: 'Tallenna muutokset', saved: 'Juoma tallennettu', updated: 'Muutokset tallennettu',
  loading: 'Ladataan juomaa…', missing: 'Juomaa ei löytynyt', loadError: 'Juomia ei voitu ladata.', saveError: 'Tallennus epäonnistui. Yritä uudelleen.',
  custom: 'Oma juoma', customPlaceholder: 'Juoman nimi', addCustom: 'Lisää', clearCustom: 'Peruuta',
  moreDrinks: 'Lisää juomia', fewerDrinks: 'Näytä vähemmän', defaultWater: 'Vesi on valittu',
  beverages: { water: 'Vesi', coffee: 'Kahvi', tea: 'Tee', soda: 'Limsa', juice: 'Mehu', milk: 'Maito', alcohol: 'Alkoholi', other: 'Muu' },
  presets: { '250': '250 ml', '350': '350 ml', '500': '500 ml', '750': '750 ml' },
  volume: 'Juoman määrä', min: '100 ml', mid: '500 ml', max: '1000 ml',
  back: 'Takaisin', close: 'Sulje', retry: 'Yritä uudelleen', edit: 'Muokkaa', delete: 'Poista',
} as const;
