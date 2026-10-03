import type { TextStyle } from 'react-native';

export type Appearance = 'light' | 'dark' | 'system';
export type TextVariant = 'caption' | 'label' | 'body' | 'sectionTitle' | 'pageTitle' | 'heroTitle' | 'homeSectionTitle';
export type ColorPair = { bg: string; fg: string };
export type ActionColors = { background: string; foreground: string; pressed: string };

export type Theme = {
  appearance: 'light' | 'dark';
  isDark: boolean;
  colors: {
    surface: { canvas: string; card: string; subtle: string };
    text: { primary: string; secondary: string; disabled: string };
    border: { default: string; selected: string; control: string };
    action: { primary: ActionColors; secondary: ActionColors; danger: ActionColors };
    disabled: { background: string; foreground: string };
    feedback: { success: ColorPair; warning: ColorPair; danger: ColorPair };
    entry: Record<'food' | 'bowel' | 'symptom' | 'water' | 'exercise' | 'sleep', ColorPair>;
    beverage: Record<'water' | 'coffee' | 'tea' | 'soda' | 'juice' | 'milk' | 'alcohol' | 'custom', ColorPair>;
    severity: Record<'mild' | 'moderate' | 'severe', ColorPair>;
    focus: string;
    overlay: string;
  };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  radius: { sm: number; md: number; lg: number; pill: number };
  typography: Record<TextVariant, TextStyle>;
  controls: { minimumTouchTarget: number; choiceTileHeight: number; icon: number; smallIcon: number; borderWidth: number; selectedBorderWidth: number; contentWidth: number; quickLogCardWidth: number };
  motion: { fast: number; normal: number; pressedScale: number };
};

const shared = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 8, md: 11, lg: 17, pill: 999 },
  typography: {
    caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    label: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.6 },
    pageTitle: { fontSize: 32, lineHeight: 35, fontWeight: '700', letterSpacing: -1.5 },
    heroTitle: { fontSize: 40, lineHeight: 42, fontWeight: '400', letterSpacing: -1.8 },
    homeSectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '400', letterSpacing: -0.6 },
  } satisfies Record<TextVariant, TextStyle>,
  controls: { minimumTouchTarget: 48, choiceTileHeight: 104, icon: 20, smallIcon: 16, borderWidth: 1, selectedBorderWidth: 2, contentWidth: 680, quickLogCardWidth: 132 },
  motion: { fast: 120, normal: 180, pressedScale: 0.98 },
};

export const lightTheme: Theme = {
  ...shared,
  appearance: 'light',
  isDark: false,
  colors: {
    surface: { canvas: '#f6f1e9', card: '#fffcf7', subtle: '#eee6dc' },
    text: { primary: '#2b1f19', secondary: '#706359', disabled: '#706359' },
    border: { default: '#e9e1d5', selected: '#2b1f19', control: '#927b68' },
    action: {
      primary: { background: '#2b1f19', foreground: '#fffcf7', pressed: '#4a382d' },
      secondary: { background: '#fffcf7', foreground: '#2b1f19', pressed: '#eee6dc' },
      danger: { background: '#fae4ea', foreground: '#ab3656', pressed: '#f6dce4' },
    },
    disabled: { background: '#eee6dc', foreground: '#706359' },
    feedback: {
      success: { bg: '#e8f3eb', fg: '#287655' },
      warning: { bg: '#fff0d8', fg: '#9b5a17' },
      danger: { bg: '#fbe7eb', fg: '#b63755' },
    },
    entry: {
      food: { bg: '#eee6dc', fg: '#2b1f19' },
      bowel: { bg: '#f1e1cc', fg: '#8e4f10' },
      symptom: { bg: '#fae4ea', fg: '#ab3656' },
      water: { bg: '#e3effa', fg: '#2266a4' },
      exercise: { bg: '#f2e7d5', fg: '#805618' },
      sleep: { bg: '#e9e4dd', fg: '#625d57' },
    },
    beverage: {
      water: { bg: '#e3effa', fg: '#2266a4' },
      coffee: { bg: '#f1e4d8', fg: '#80522f' },
      tea: { bg: '#e8eddc', fg: '#536b2f' },
      soda: { bg: '#fae4e4', fg: '#a13e49' },
      juice: { bg: '#f5e5d1', fg: '#915116' },
      milk: { bg: '#f3ecdf', fg: '#7e603d' },
      alcohol: { bg: '#f3e2c8', fg: '#86511f' },
      custom: { bg: '#eee6dc', fg: '#2b1f19' },
    },
    severity: {
      mild: { bg: '#e8f3eb', fg: '#287655' },
      moderate: { bg: '#fff0d8', fg: '#9b5a17' },
      severe: { bg: '#fbe7eb', fg: '#b63755' },
    },
    focus: '#2b1f19',
    overlay: 'rgba(43,31,25,0.45)',
  },
};

export const darkTheme: Theme = {
  ...shared,
  appearance: 'dark',
  isDark: true,
  colors: {
    surface: { canvas: '#1a1411', card: '#261d18', subtle: '#3b2f28' },
    text: { primary: '#f4ebe0', secondary: '#b9a99c', disabled: '#b9a99c' },
    border: { default: '#463930', selected: '#f4ebe0', control: '#927b6a' },
    action: {
      primary: { background: '#f4ebe0', foreground: '#1a1411', pressed: '#d7c7b8' },
      secondary: { background: '#261d18', foreground: '#f4ebe0', pressed: '#3b2f28' },
      danger: { background: '#482a34', foreground: '#f49bb1', pressed: '#5a303e' },
    },
    disabled: { background: '#3b2f28', foreground: '#b9a99c' },
    feedback: {
      success: { bg: '#223b2d', fg: '#8fd2a8' },
      warning: { bg: '#49331e', fg: '#f1bb70' },
      danger: { bg: '#49272f', fg: '#f19aae' },
    },
    entry: {
      food: { bg: '#3b2f28', fg: '#f4ebe0' },
      bowel: { bg: '#463022', fg: '#dfa163' },
      symptom: { bg: '#482a34', fg: '#f49bb1' },
      water: { bg: '#253a4c', fg: '#72b4eb' },
      exercise: { bg: '#433622', fg: '#d0a153' },
      sleep: { bg: '#39332e', fg: '#bdb2a8' },
    },
    beverage: {
      water: { bg: '#253a4c', fg: '#72b4eb' },
      coffee: { bg: '#412c20', fg: '#e0b28e' },
      tea: { bg: '#303b20', fg: '#b8d184' },
      soda: { bg: '#4b282e', fg: '#f0a0aa' },
      juice: { bg: '#49321e', fg: '#edb16d' },
      milk: { bg: '#3e3326', fg: '#dfc398' },
      alcohol: { bg: '#44301c', fg: '#e7b367' },
      custom: { bg: '#3b2f28', fg: '#f4ebe0' },
    },
    severity: {
      mild: { bg: '#223b2d', fg: '#8fd2a8' },
      moderate: { bg: '#49331e', fg: '#f1bb70' },
      severe: { bg: '#49272f', fg: '#f19aae' },
    },
    focus: '#f4ebe0',
    overlay: 'rgba(0,0,0,0.65)',
  },
};
