import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FEFDFD',
    surface: '#FFFFFF',
    surfaceElevated: '#F4F4F6',
    border: '#EDEDEF',
    text: '#000000',
    textSecondary: '#6E6E78',
    textMuted: '#9A9AA0',
    accent: '#000000',
    streak: '#F4685C',
    protein: '#F4685C',
    carbs: '#F0A424',
    fat: '#F7C948',
  },
  dark: {
    background: '#111114',
    surface: '#1A1A1E',
    surfaceElevated: '#242429',
    border: '#2A2A30',
    text: '#FFFFFF',
    textSecondary: '#9A9AA0',
    textMuted: '#6E6E78',
    accent: '#FFFFFF',
    streak: '#F4685C',
    protein: '#F4685C',
    carbs: '#F0A424',
    fat: '#F7C948',
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 49, default: 68 });
