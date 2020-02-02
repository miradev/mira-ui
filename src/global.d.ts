import { ManifestJSON } from "./manifest"
import { WidgetSettingsJSON } from "./widget-settings";

declare global {
  interface Document {
    createRootDiv(id: string): HTMLDivElement
  }
  interface Window {
    srcDir: string
    widgetDir: string
    pathJoin(...paths: string[]): string
    readManifest(manifestFile: string): ManifestJSON
    readFolders(directory: string): string[]
    readWidgetSettings(widgetSettingsFile: string): WidgetSettingsJSON
  }
}
