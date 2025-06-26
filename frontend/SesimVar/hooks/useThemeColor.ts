import { Colors } from '../theme/colors';

type ThemeColorName = keyof typeof Colors;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeColorName
) {
  const colorFromProps = props.light || props.dark;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[colorName];
  }
}
