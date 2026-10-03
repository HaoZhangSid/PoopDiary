import type en from './en';
export default {
  common: {
    appName: 'Poop Diary', today: 'Tänään', diary: 'Päiväkirja', insights: 'Näkymät', profile: 'Profiili', log: 'Kirjaa',
    bowel: 'Ulostus', food: 'Ruoka', symptom: 'Oireet', water: 'Juomat', exercise: 'Liikunta', sleep: 'Uni',
    back: 'Takaisin', close: 'Sulje', cancel: 'Peruuta', save: 'Tallenna', edit: 'Muokkaa', delete: 'Poista', undo: 'Kumoa',
    loading: 'Ladataan…', retry: 'Yritä uudelleen', error: 'Toiminto epäonnistui. Yritä uudelleen.', saved: 'Tallennettu', updated: 'Päivitetty', deleted: 'Poistettu', restored: 'Palautettu',
    startupError: 'Päiväkirjaa ei voitu avata.', empty: 'Ei merkintöjä', previousDay: 'Edellinen päivä', nextDay: 'Seuraava päivä',
    type: 'Tyyppi {{type}}', unknown: 'En ole varma', time: 'Aika', date: 'Päivämäärä', notes: 'Muistiinpanot',
  },
  home: {
    title: 'Tänään', quickLog: 'Kirjaa ulostus', recent: 'Päivän merkinnät',
    entryCount: '{{count}} merkintä', entryCount_other: '{{count}} merkintää', allEntries: 'Avaa päiväkirja',
    empty: 'Ei merkintöjä tänään', bowelCount: '{{count}} ulostuskerta', bowelCount_other: '{{count}} ulostuskertaa',
    quickTitle: 'Pikakirjaus', overview: 'Päivän yhteenveto', streak: 'putki', days: 'päivä', addFirst: 'Lisää merkintä',
    mealsLabel: 'Ateriat', bowelLabel: 'Ulostus', symptomLabel: 'Oireet', exerciseLabel: 'Liikunta', sleepLabel: 'Uni', times: 'kertaa', entry: 'merkintä', lastNight: 'viime yö', waterGoal: '/ 2000 ml',
    greetings: { night: 'Hyvää yötä', morning: 'Hyvää huomenta', noon: 'Hyvää päivää', afternoon: 'Hyvää iltapäivää', evening: 'Hyvää iltaa' },
  },
  diary: {
    title: 'Päiväkirja', add: 'Lisää merkintä', empty: 'Ei merkintöjä tältä päivältä', details: 'Merkintä',
    deleteTitle: 'Poistetaanko merkintä?', deleteError: 'Poistaminen epäonnistui. Yritä uudelleen.',
    restoreError: 'Palauttaminen epäonnistui. Yritä uudelleen.', missing: 'Merkintää ei löytynyt',
  },
  profile: {
    title: 'Profiili', language: 'Kieli', appearance: 'Ulkoasu',
    light: 'Vaalea', dark: 'Tumma', system: 'Järjestelmä', components: 'Komponentit',
    localData: 'Merkinnät tallennetaan tälle laitteelle.', settingsError: 'Asetusta ei voitu tallentaa.',
  },
  components: {
    title: 'Komponentit', buttons: 'Painikkeet', choices: 'Valinnat', slider: 'Liukusäädin', stepper: 'Askelpainike',
    sheet: 'Ponnahdusikkuna', openSheet: 'Avaa ponnahdusikkuna', longText: 'Tämä pidempi vaihtoehdon teksti rivittyy ilman sisällön leikkaamista',
    selected: 'Valittu', unselected: 'Ei valittu', loading: 'Tallennetaan', disabled: 'Ei käytettävissä',
    feedback: 'Palaute', showFeedback: 'Näytä tallennuspalaute', error: 'Tallentaminen epäonnistui', errorDetail: 'Luonnos on yhä tallessa.',
    amount: 'Määrä', decrease: 'Vähennä', increase: 'Lisää',
  },
} satisfies typeof en;
