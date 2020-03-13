import * as path from "path"
import * as fs from "fs"
import { WidgetSettingWithPages, WidgetSettingsJSON } from './widget-settings'

const TOKEN_FILENAME = "token"
const WIDGETS_FOLDER = "widgets"

export interface ServerConfig {
  protocol: string
  serverUrl: string
  serverPort: string
}

const defaultConfig: ServerConfig = {
  protocol: "http",
  serverUrl: "192.168.0.35",
  serverPort: "8000",
}

export interface UpdateData {
  widgets: {
    [id: string]: WidgetSettingWithPages
  }
  fileNames: string[]
}

export function readConfig(directory: string): ServerConfig {
  const fileName = path.join(directory, "config.json")
  if (fs.existsSync(fileName)) {
    const file = fs.readFileSync(fileName, { encoding: "utf-8" })
    const config: ServerConfig = JSON.parse(file)
    if (config.protocol && config.serverUrl && config.serverPort) {
      return config
    }
  }
  return defaultConfig
}

export function writeWidgetSettings(directory: string, widgetSettings: WidgetSettingsJSON) {
  const fileName = path.join(directory, "widget_settings.json")
  fs.writeFileSync(fileName, JSON.stringify(widgetSettings), { encoding: "utf-8" })
}

export function readToken(directory: string): string | null {
  const fileName = path.join(directory, TOKEN_FILENAME)
  if (fs.existsSync(fileName)) {
    const file = fs.readFileSync(fileName, { encoding: "utf-8" })
    if (file.length > 0) {
      return file
    }
  }
  return null
}

export function writeToken(directory: string, value: string): void {
  const fileName = path.join(directory, TOKEN_FILENAME)
  fs.writeFileSync(fileName, value, { encoding: "utf-8" })
}

export function removeTokenIfExists(directory: string): void {
  const fileName = path.join(directory, TOKEN_FILENAME)
  if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName)
  }
}

export function checkWidgetsFolder(directory: string): void {
  const widgetsFolder = path.join(directory, WIDGETS_FOLDER)
  if (!fs.existsSync(widgetsFolder)) {
    fs.mkdirSync(widgetsFolder)
  }
}
