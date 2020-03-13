import type { ManifestJSON } from "../manifest"
import type { WidgetSettingsJSON, WidgetSetting, PageSettingJSON } from "../widget-settings"

const WIDGET_SETTINGS = "widget_settings.json"
const MANIFEST = "manifest.json"
const SLEEP_DURATION = 60 * 1000

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

  let sleep = setTimeout(() => {
    sleepView()
  }, SLEEP_DURATION)

  function wakeView() {
    document.body.style.opacity = "1"
    clearTimeout(sleep)
    sleep = setTimeout(() => {
      sleepView()
    }, SLEEP_DURATION)
  }

  function isAsleep() {
    return document.body.style.opacity == "0"
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
    private activePageNumber: number = 0

    constructor(widgetSettings: WidgetSettingsJSON | null) {
      this.settings = widgetSettings
      this.pageSize = widgetSettings?.pages?.length ?? 1
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
        if (widgetInstance.vue) {
          widgetInstance.vue.$emit("config", settings.config)
        }
        console.log(`Loading widget settings for widget ${widgetInstance.manifest.name}`, settings)
        const el = document.getElementById(id)!
        if (settings.style) {
          console.log(`Loading custom styling for widget ${widgetInstance.manifest.name}`, settings.style)
          Object.assign(el.style, settings.style)
        }
      }
    }

    /**
     * Loads the specific settings for a widget, given the widget's ID string originally defined from its manifest
     * If no setting is found for this widget ID, returns an "empty setting" defined by null.
     * 
     * @param widgetId id of the widget
     */
    private loadSetting(widgetId: string): WidgetSetting | null {
      if (this.settings && this.settings.widgets && this.settings.widgets[widgetId]) {
        const widgetSetting: WidgetSetting = this.settings.widgets[widgetId]
        return widgetSetting
      }
      return null
    }

    /**
     * Creates an array of div elements, each representing a "page",
     * then sets up the page mapping for each widget loaded (which widget goes on which page),
     * and adds all the page div elements to document.body when the DOM is ready.
     * 
     * By default, if the widget settings JSON file is not available, there will only be a single
     * page (div element with id #page0).
     */
    private setupPages() {
      // Create the pages
      for (let i = 0; i < this.pageSize; i++) {
        const page = document.createPageDiv(i)
        this.pages.push(page)
      }
      // Setup widget->page mapping for each widget
      if (this.settings && this.settings.pages) {
        for (let i = 0; i < this.pageSize; i++) {
          const pageSetting = this.settings.pages[i]
          for (const widgetId of pageSetting.ids) {
            this.pageMapping.set(widgetId, i)
          }
        }
      }
      console.log(`Setting up ${this.pageSize} pages`)
      // Append all the page div elements to the document body when DOM is ready
      window.addEventListener("DOMContentLoaded", () => {
        for (const page of this.pages) {
          document.body.appendChild(page)
        }
      })
      // Set active page to the first page
      this.switchActivePage(0)
    }

    public switchActivePage(delta: number) {
      let pageNum = this.activePageNumber + delta
      // Wrap around
      if (pageNum < 0) {
        pageNum = this.pageSize - 1
      } else if (pageNum >= this.pageSize) {
        pageNum = 0
      }

      // Hide old active page
      this.pages[this.activePageNumber].style.opacity = "0"
      // Show current active page
      this.activePageNumber = pageNum
      this.pages[this.activePageNumber].style.opacity = "1"

      console.log(`Switched to page ${this.activePageNumber}`)
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
    if (isAsleep()) {
      wakeView()
    } else {
      widgetManager.switchActivePage(-1)
      wakeView()
    }
  })

  win.ipcRenderer.on("!right", () => {
    if (isAsleep()) {
      wakeView()
    } else {
      widgetManager.switchActivePage(1)
      wakeView()
    }
  })

  win.ipcRenderer.on("wake", () => {
    wakeView()
  })
})()
