import * as AdmZip from "adm-zip"
import * as fs from "fs"
import * as path from "path"
import config from "./config"
import { readFolders, readZips } from "./utils"
import { IManifestJSON, readManifest } from "./widgets/manifest"
import { isWidgetSubclass, Widget } from "./widgets/widget"
;(() => {
  // TODO: caching of decompressed files from zip on filesystem

  // Un-zip all widget.zip files to application's widgets folder
  const zipFiles = readZips(config.widgetDirectory)
  const widgetFolderDir = path.join(config.appDirectory, "widgets")
  zipFiles.forEach(zipFileName => {
    const zipFile = path.join(config.widgetDirectory, zipFileName)
    const zip = new AdmZip(zipFile)
    const manifest = JSON.parse(zip.readAsText("manifest.json")) as IManifestJSON
    const folder = path.join(widgetFolderDir, manifest.id)
    if (!fs.existsSync(folder)) {
      zip.extractAllTo(folder, true)
    }
  })

  // Load widgets on runtime
  const widgetFolders = readFolders(widgetFolderDir)
  widgetFolders
    .map(folder => path.join(widgetFolderDir, folder))
    .forEach(widgetFolder => {
      const manifest = readManifest(path.join(widgetFolder, "manifest.json"))
      const js = path.join(widgetFolder, manifest.entrypoint.js)
      const widget = require(js)
      if (isWidgetSubclass(widget)) {
        const instance = new widget(manifest, {
          appDirectory: config.appDirectory,
          widgetDirectory: widgetFolder,
        }) as Widget
        instance.run()
      }
    })
})()
