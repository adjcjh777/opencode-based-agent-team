export interface UiTheme {
  brand: string;
  accent: string;
  muted: string;
  danger: string;
}

export const DEFAULT_THEME: UiTheme = {
  brand: 'cyan',
  accent: 'green',
  muted: 'gray',
  danger: 'red'
};
