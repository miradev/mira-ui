import * as path from "path"
import { IConfig } from "../config"
import { IManifestJSON } from "./manifest"

export class Widget {
  private readonly manifest: IManifestJSON
  private readonly root: HTMLDivElement
  private readonly config: IConfig

  constructor(manifest: IManifestJSON, config: IConfig) {
    this.manifest = manifest
    this.root = this.createRootNode()
    this.config = config

    this.loadCss()
  }

  public run(): void {
    // default no-op
  }

  private createRootNode(): HTMLDivElement {
    const miraRoot = document.getElementById("mira")
    const root = document.createElement("div")
    root.id = this.manifest.id
    miraRoot.appendChild(root)
    return root
  }

  private loadCss(): void {
    if (this.manifest.entrypoint.css) {
      const link = document.createElement("link")
      link.type = "text/css"
      link.rel = "stylesheet"
      link.href = path.relative(
        this.config.widgetDirectory,
        path.join(this.config.widgetDirectory, this.manifest.entrypoint.css),
      )
      document.getElementsByTagName("head")[0].appendChild(link)
    }
  }
}

export function isWidgetSubclass(clazz: any) {
  return typeof clazz === "function" && /class .+ extends Widget/.test(clazz.toString())
}
