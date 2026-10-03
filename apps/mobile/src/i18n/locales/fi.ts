import type en from './en';
export default {
  common: {
    appName: 'Poop Diary', today: 'Tänään', diary: 'Päiväkirja', insights: 'Näkymät', profile: 'Profiili', log: 'Kirjaa',
    bowel: 'Ulostus', food: 'Ruoka', symptom: 'Oireet', water: 'Juomat', exercise: 'Liikunta', sleep: 'Uni',
    back: 'Takaisin', close: 'Sulje', cancel: 'Peruuta', save: 'Tallenna', edit: 'Muokkaa', delete: 'Poista', undo: 'Kumoa',
    loading: 'Ladataan…', retry: 'Yritä uudelleen', error: 'Toiminto epäonnistui. Yritä uudelleen.', saved: 'Tallennettu', updated: 'Päivitetty', deleted: 'Poistettu', restored: 'Palautettu',
    startupError: 'Päiväkirjaa ei voitu avata.', empty: 'Ei merkintöjä', previousDay: 'Edellinen päivä', nextDay: 'Seuraava päivä',
    type: 'Tyyppi {{type}}', unknown: 'En ole varma', time: 'Aika', date: 'Päivämäärä', notes: 'Muistiinpanot', minutes: 'min', hours: 't', aiInsightsOn: 'Tekoälynäkymät käytössä',
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
    title: 'Päiväkirja', add: 'Lisää merkintä', eyebrow: 'KEHO KOKONAISUUTENA', empty: 'Ei merkintöjä tältä päivältä', details: 'Merkintä',
    deleteTitle: 'Poistetaanko merkintä?', deleteError: 'Poistaminen epäonnistui. Yritä uudelleen.',
    restoreError: 'Palauttaminen epäonnistui. Yritä uudelleen.', missing: 'Merkintää ei löytynyt',
  },
  profile: {
    title: 'Profiili', name: 'Nimi', language: 'Kieli', appearance: 'Ulkoasu', tracking: 'Seuranta', aiAnalysis: 'Tekoälyanalyysi', reminders: 'Muistutukset', privacy: 'Tiedot ja yksityisyys', aiInsights: 'Tekoälyhavainnot', dailyReminder: 'Päivittäinen muistutus', weeklyReport: 'Viikkoraportti', dailyTime: 'Joka päivä 20.00', weeklyDay: 'Joka sunnuntai', export: 'Vie tietoni', aiData: 'Tekoälyasetukset', deleteData: 'Poista tietoni', editProfile: 'Muokkaa profiilia', saveProfile: 'Tallenna profiili', more: 'Muut profiilitoiminnot', food: 'Ruoka', bowel: 'Uloste', symptoms: 'Oireet', water: 'Juoma', exercise: 'Liikunta', sleep: 'Uni',
    light: 'Vaalea', dark: 'Tumma', system: 'Järjestelmä', components: 'Komponentit',
    localData: 'Merkinnät tallennetaan tälle laitteelle.', settingsError: 'Asetusta ei voitu tallentaa.',
  },
  components: {
    title: 'Komponentit', buttons: 'Painikkeet', iconButtons: 'Kuvakepainikkeet', choices: 'Valinnat', slider: 'Liukusäädin', stepper: 'Askelpainike',
    sheet: 'Ponnahdusikkuna', openSheet: 'Avaa ponnahdusikkuna', longText: 'Tämä pidempi vaihtoehdon teksti rivittyy ilman sisällön leikkaamista',
    selected: 'Valittu', unselected: 'Ei valittu', loading: 'Tallennetaan', disabled: 'Ei käytettävissä',
    feedback: 'Palaute', showFeedback: 'Näytä tallennuspalaute', error: 'Tallentaminen epäonnistui', errorDetail: 'Luonnos on yhä tallessa.',
    amount: 'Määrä', decrease: 'Vähennä', increase: 'Lisää',
  },
  insights: {
    title: 'Näkymät', subtitle: 'Havainnot ajan mittaan', range: 'rajaus', stoolEyebrow: 'ULOSTEEN MUODOT', symptomsEyebrow: 'OIREET', days: 'päivää', period: 'Viimeiset {{range}} päivää', stoolTitle: 'Ulosteen muoto', symptomsTitle: 'Oireet', type: 'Tyyppi {{type}}', tapHint: 'Perustuu merkintöihisi', week: ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'], bloating: 'Turvotus', pain: 'Kipu', patternEyebrow: 'Tekoälyhavainto', aiOff: 'Tekoälyhavainnot pois', patternTitle: 'Mahdollinen havainto', openAI: 'Ota tekoälyhavainnot käyttöön profiilissa.', patternBody: '{{count}} turvotusmerkintää tällä ajalla.', noData: 'Jatka kirjaamista nähdäksesi havaintoja.', meals: 'ateriaa', collapse: 'Piilota tiedot', why: 'Miksi näen tämän?', related: 'Näytä liittyvät merkinnät', disclaimer: 'Tämä on havainto merkinnöistäsi, ei diagnoosi.', noRelated: 'Ei liittyviä merkintöjä.', consistency: 'Kirjausrytmi', activeDays: 'aktiivista päivää', report: 'Avaa 14 päivän raportti',
  },
  report: {
    title: '14 päivän raportti', eyebrow: '14 PÄIVÄN RAPORTTI', coverageLabel: 'KATTAVUUS', coverage: 'Kattavuus', backToInsights: 'Takaisin näkymiin', reviewed: '{{count}} merkintää tarkasteltu', periodLegend: 'Kova · Ihanteellinen · Löysä', typeLabel: 'Tyyppi {{type}}', times: 'kertaa', entry: 'merkintä', meal: 'ateria', stoodOut: 'MITÄ NOUSI ESIIN', clearerPicture: 'Jatka kirjaamista saadaksesi selkeämmän kuvan.', coveragePercent: 'Kattavuus', ofDays: '/ 14 päivää', entries: '{{count}} merkintää', empty: 'Ei merkintöjä viimeiseltä 14 päivältä', bowel: 'Ulostus', symptoms: 'Oireet', food: 'Ateriat', dairy: 'Maitotuoteateriat', stool: 'Uloste', stoolTitle: 'Ulosteen muoto', hard: 'Kova · Tyyppi 1–2', ideal: 'Ihanteellinen · Tyyppi 3–4', loose: 'Löysä · Tyyppi 5–7', most: 'Yleisin: tyyppi {{type}} ({{count}})', focus: 'Havaintoja', focusTitle: 'Viimeaikaiset havainnot', summary: 'Merkintäsi ovat valmiina tarkasteltaviksi.', notEnough: 'Jatka kirjaamista saadaksesi selkeämmän kuvan.', aiOff: 'Tekoälyhavainnot pois', aiDisabled: 'Ota tekoälyhavainnot käyttöön profiilissa.', disclaimerTitle: 'Yhteenveto merkinnöistä, ei diagnoosi', disclaimer: 'Vain seurantaan. Tämä ei ole lääketieteellinen arvio.',
  },
} satisfies typeof en;
