export type SliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  label?: string;
  tone?: 'primary' | 'food' | 'bowel' | 'symptom' | 'water' | 'exercise' | 'sleep';
  testID?: string;
};
