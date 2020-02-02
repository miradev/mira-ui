export interface WidgetSettingsJSON {
  widgets: WidgetSettings
}

export interface WidgetSettings {
  [key: string]: WidgetSetting
}

export interface WidgetSetting {
  x: number
  y: number
}
