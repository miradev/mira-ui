import type { ManifestJSON } from "./manifest"
import type { WidgetSettingsJSON } from "./widget-settings"
import type { ServerConfig } from "./config"
import { IpcRenderer } from "electron"

declare global {
  interface Document {
    createPageDiv(pageNum: number): HTMLDivElement
    createDivForPage(divId: string, pageEl: HTMLDivElement): HTMLDivElement
  }
  interface Window {
    srcDir: string
    widgetDir: string
    ipcRenderer: IpcRenderer
    hwid: { mac: string; serial: string }
    serverConfig: ServerConfig
    pathJoin(...paths: string[]): string
    readManifest(manifestFile: string): ManifestJSON
    readFolders(directory: string): string[]
    readWidgetSettings(widgetSettingsFile: string): WidgetSettingsJSON | null
  }
}
