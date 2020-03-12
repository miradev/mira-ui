import type { ManifestJSON } from "../manifest"
import type { WidgetSettingsJSON, WidgetSetting, PageSettingJSON } from "../widget-settings"

const WIDGET_SETTINGS = "widget_settings.json"
const MANIFEST = "manifest.json"

/**
 * Publically exposed widget manager API, accessed by custom widgets through the "wm" global variable
 */
interface WidgetManager {
  register(widgetInstance: any): void
}

const wm: WidgetManager = {
  // tslint:disable: no-empty
  register(widgetInstance: any) {},
}

// Private anonymous function that constructs a widget manager local to this script file,
// which then has the public methods exposed through the "wm" global variable
;(() => {
  const win = window as Window

  function sleepView() {
    document.body.style.opacity = "0"
  }

  function wakeView() {
    document.body.style.opacity = "1"
  }

  win.ipcRenderer.on("!sleep", () => {
    sleepView()
  })

  win.ipcRenderer.on("!wake", () => {
    wakeView()
  })

  class BaseWidgetManager implements WidgetManager {
    private readonly settings: WidgetSettingsJSON | null
    private readonly widgets: Map<string, any> = new Map<string, any>()
    private readonly manifests: Map<string, ManifestJSON> = new Map<string, ManifestJSON>()

    // Mapping of widget id to page number, read from settings
    private readonly pageMapping: Map<string, number> = new Map<string, number>()
    private readonly pageSize: number
    private readonly pages: HTMLDivElement[] = []

    constructor(widgetSettings: WidgetSettingsJSON | null) {
      this.settings = widgetSettings
      this.pageSize = widgetSettings?.pages.length ?? 1
      this.setupPages()
    }

    public load(manifest: ManifestJSON) {
      this.manifests.set(manifest.id, manifest)

      // Register widget script
      const script = document.createElement("script")
      script.src = `../widgets/${manifest.id}/${manifest.entrypoint.js}`
      document.getElementsByTagName("head")[0].appendChild(script)

      // Register css styling
      if (manifest.entrypoint.css) {
        const styleLink = document.createElement("link")
        styleLink.type = "text/css"
        styleLink.rel = "stylesheet"
        styleLink.href = `../widgets/${manifest.id}/${manifest.entrypoint.css}`
        document.getElementsByTagName("head")[0].appendChild(styleLink)
      }
    }

    public register(widgetInstance: any) {
      // Construct a div wrapper for the given widget instance
      const id = widgetInstance.id
      const pageEl = this.pages[this.pageMapping.get(id) ?? 0]
      const div = document.createDivForPage(id, pageEl)

      // [Delegated widget constructor] initialize some readonly local variables for widget instance
      // e.g. div wrapper for the given widget instance, and its corresponding manifest file
      Object.defineProperty(widgetInstance, "manifest", {
        value: this.manifests.get(id),
        writable: false,
      })
      Object.freeze(widgetInstance.manifest)
      Object.defineProperty(widgetInstance, "rootDiv", {
        value: div,
        writable: false,
      })

      // Save widget instance to wm widgets map
      this.widgets.set(div.id, widgetInstance)

      // Setup widget (if necessary)
      if (typeof widgetInstance.setup === "function") {
        widgetInstance.setup()
      }

      // "Main method" of a widget
      if (typeof widgetInstance.run === "function") {
        widgetInstance.run()
      }

      console.log(`Widget ${widgetInstance.manifest.name} loaded.`)

      const settings: WidgetSetting | null = this.loadSetting(id)
      if (settings) {
        console.log(`Loading widget settings for widget ${widgetInstance.manifest.name}`)
        const el = document.getElementById(id)!
        if (settings.style) {
          console.log(`Loading custom styling for widget ${widgetInstance.manifest.name}`)
          Object.assign(el.style, settings.style)
        }
      }
    }

    private loadSetting(widgetId: string): WidgetSetting | null {
      if (this.settings && this.settings.widgets[widgetId]) {
        const widgetSetting: WidgetSetting = this.settings.widgets[widgetId]
        return widgetSetting
      }
      return null
    }

    private setupPages() {
      // Create the pages
      for (let i = 0; i < this.pageSize; i++) {
        const page = document.createPageDiv(i)
        this.pages.push(page)
      }
      console.log("Setting up pages")
      // Setup widget->page mapping for each widget
      if (this.settings) {
        for (let i = 0; i < this.pageSize; i++) {
          const pageSetting = this.settings.pages[i]
          for (const widgetId of pageSetting.ids) {
            this.pageMapping.set(widgetId, i)
          }
        }
      }

      window.addEventListener("DOMContentLoaded", () => {
        for (const page of this.pages) {
          document.body.appendChild(page)
        }
      })
    }
  }

  const widgetSettings = win.readWidgetSettings(win.pathJoin(win.widgetDir, WIDGET_SETTINGS))
  const widgetManager = new BaseWidgetManager(widgetSettings)

  // Expose public widget manager methods to the global "wm" object
  wm.register = widgetManager.register.bind(widgetManager)
  Object.freeze(wm)

  // Load widgets based on each manifest.json in the application's widget directory
  const widgetFolders = win.readFolders(win.widgetDir) as string[]
  widgetFolders
    .map(folderName => win.pathJoin(win.widgetDir, folderName) as string)
    .forEach(folder => {
      const manifest = win.readManifest(win.pathJoin(folder, MANIFEST))
      widgetManager.load(manifest)
    })

  // Configure widgets in pages
  win.ipcRenderer.on("!left", () => {
    console.log("LEFT")
  })

  win.ipcRenderer.on("!right", () => {
    console.log("RIGHT")
  })
})()
