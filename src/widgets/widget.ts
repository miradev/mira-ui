import * as path from "path"
import { IConfig } from "../config"
import { IManifestJSON } from "./manifest"

/**
 * A widget class that can be extended for loading on runtime
 */
export class Widget {
  private readonly manifest: IManifestJSON
  private readonly rootDiv: HTMLDivElement
  private readonly config: IConfig

  constructor(manifest: IManifestJSON, config: IConfig) {
    this.manifest = manifest
    this.config = config
    this.rootDiv = createRootDiv(this.manifest.id)
    this.loadCss()
  }

  public run(): void {
    // default no-op
  }

  /**
   * Loads the specified css file if it was set in the manifest.json file
   */
  private loadCss(): void {
    if (this.manifest.entrypoint.css) {
      const link = document.createElement("link")
      link.type = "text/css"
      link.rel = "stylesheet"
      link.href = path.relative(
        this.config.appDirectory,
        path.join(this.config.widgetDirectory, this.manifest.entrypoint.css),
      )
      document.getElementsByTagName("head")[0].appendChild(link)
    }
  }
}

/**
 * Creates a "root HTML div" for this widget
 */
function createRootDiv(id: string): HTMLDivElement {
  const miraRoot = document.getElementById("mira")
  const root = document.createElement("div")
  root.id = id
  miraRoot.appendChild(root)
  return root
}

/**
 * Checks whether a given variable is a widget class declaration
 * @param clazz variable that holds class declaration
 */
export function isWidgetSubclass(clazz: any): boolean {
  return typeof clazz === "function" && /class .+ extends Widget/.test(clazz.toString())
}
