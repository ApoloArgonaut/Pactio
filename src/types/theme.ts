export type ThemeMode = 'midnight' | 'warm' | 'contrast';
export type ActiveTab = 'landing' | 'creator' | 'vault' | 'client-review' | 'confirmed';

export interface ThemeStyles {
  themeClasses: string;
  headerBg: string;
  panelBg: string;
  inputClass: string;
  labelClass: string;
  paperClasses: string;
  pillClass: string;
  infoBoxClass: string;
  ipBannerClass: string;
  previewBackdropClass: string;
  selectClass: string;
  inlineSelectClass: string;
  optionClass: string;
}
