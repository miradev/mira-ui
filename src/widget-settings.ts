export interface WidgetSettingsJSON {
  pages?: PageSettingJSON[]
  widgets?: {
    [id: string]: WidgetSetting
  }
}

export interface PageSettingJSON {
  ids: string[]
}

export interface WidgetSetting {
  style?: {
    [key: string]: string
  }
  config?: {
    [configKey: string]: string | number | boolean | null
  }
}
