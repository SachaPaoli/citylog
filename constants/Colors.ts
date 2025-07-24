/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
const beigeColor = '#E5C9A6'; // Couleur beige plus claire

export const Colors = {
  light: {
    text: '#E5C9A6', // Beige plus clair pour tous les textes
    background: '#1A1A1A', // Gris très foncé
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    beige: '#E5C9A6', // Couleur beige plus claire disponible
  },
  dark: {
    text: '#E5C9A6', // Beige plus clair pour tous les textes
    background: '#1A1A1A', // Gris très foncé
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    beige: '#E5C9A6', // Couleur beige plus claire disponible
  },
};
