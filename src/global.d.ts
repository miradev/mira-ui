import { ManifestJSON } from "./manifest"
import { WidgetSettingsJSON } from "./widget-settings"
import { IpcRenderer } from "electron"
import { Config } from "./config"

declare global {
  interface Document {
    createRootDiv(id: string): HTMLDivElement
  }
  interface Window {
    srcDir: string
    widgetDir: string
    ipcRenderer: IpcRenderer
    hwid: { mac: string; serial: string }
    serverConfig: Config
    pathJoin(...paths: string[]): string
    readManifest(manifestFile: string): ManifestJSON
    readFolders(directory: string): string[]
    readWidgetSettings(widgetSettingsFile: string): WidgetSettingsJSON | null
  }
}
