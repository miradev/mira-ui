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

export interface WidgetSettingWithPages {
  page: number
  style?: {
    [key: string]: string
  }
  config?: {
    [configKey: string]: string | number | boolean | null
  }
}

export function createWidgetSettings(widgets: { [key: string]: WidgetSettingWithPages }): WidgetSettingsJSON {
  const maxPage = Object.values(widgets)
    .map(setting => setting.page)
    .reduce((old, page) => {
      return Math.max(old, page)
    })

  const pages: PageSettingJSON[] = new Array(maxPage)
  for (let i = 0; i < maxPage; i++) {
    pages[i] = { ids: [] }
  }

  for (let [id, setting] of Object.entries(widgets)) {
    pages[setting.page - 1].ids.push(id)
  }

  return {
    pages,
    widgets,
  }
}
