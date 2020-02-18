import { ManifestJSON } from "./manifest"
import { WidgetSettingsJSON } from "./widget-settings";
import { IpcRenderer } from "electron";

declare global {
  interface Document {
    createRootDiv(id: string): HTMLDivElement
  }
  interface Window {
    srcDir: string
    widgetDir: string
    ipcRenderer: IpcRenderer
    pathJoin(...paths: string[]): string
    readManifest(manifestFile: string): ManifestJSON
    readFolders(directory: string): string[]
    readWidgetSettings(widgetSettingsFile: string): WidgetSettingsJSON | null
  }
}
