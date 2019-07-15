import { IManifestJSON } from "../manifest"

/**
 * Publically exposed widget manager API, accessed by custom widgets through the "wm" global variable
 */
interface IWidgetManager {
  register(widgetInstance: any): void
}

// tslint:disable-next-line: prefer-const
const wm: IWidgetManager = {
    register(widgetInstance: any) {
      // no-op
    },
  }

  // Private anonymous function that constructs a widget manager local to this script file,
  // which then has the public methods exposed through the "wm" global variable
;(() => {
  const win = window as any

  class WidgetManager implements IWidgetManager {
    private readonly widgets: Map<string, any> = new Map<string, any>()
    private readonly manifests: Map<string, IManifestJSON> = new Map<string, IManifestJSON>()

    public load(manifest: IManifestJSON) {
      this.manifests.set(manifest.id, manifest)

      // Register script
      const script = document.createElement("script")
      script.src = `../widgets/${manifest.id}/${manifest.entrypoint.js}`
      document.getElementsByTagName("head")[0].appendChild(script)

      // Register css
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
      const div = document.createElement("div")
      const id = widgetInstance.id
      div.id = id

      // Set up some local variables for widget instance (delegated constructor through this manager class)
      widgetInstance.manifest = this.manifests.get(id)
      widgetInstance.rootDiv = div
      document.body.appendChild(div)

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
    }
  }

  const widgetManager = new WidgetManager()
  // expose public widget manager methods to the global "wm" object
  wm.register = widgetManager.register.bind(widgetManager)

  // load widgets based on each manifest.json in the application's widget directory
  const widgetFolders = win.readFolders(win.widgetDir) as string[]
  widgetFolders
    .map(folderName => win.pathJoin(win.widgetDir, folderName) as string)
    .forEach(folder => {
      const manifest = win.readManifest(win.pathJoin(folder, "manifest.json"))
      widgetManager.load(manifest)
    })
})()
