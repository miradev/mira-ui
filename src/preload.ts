import * as AdmZip from "adm-zip"
import { remote } from "electron"
import * as fs from "fs"
import * as path from "path"
import { ManifestJSON } from "./manifest"
import * as rimraf from "rimraf"
import { WidgetSettingsJSON } from "./widget-settings"
import { ipcRenderer } from "electron"
import * as hwid from "./hwid"

const WIDGET_SETTINGS = "widget_settings.json"
const MANIFEST = "manifest.json"

document.createPageDiv = (pageNum: number): HTMLDivElement => {
  const page = document.createElement("div")
  page.id = `page${pageNum}`
  page.className = "page"
  page.style.opacity = "0"
  return page
}

document.createDivForPage = (divId: string, pageEl: HTMLDivElement): HTMLDivElement => {
  const div = document.createElement("div")
  div.id = divId
  pageEl.appendChild(div)
  return div
}

window.pathJoin = path.join

window.srcDir = __dirname

window.widgetDir = path.join(__dirname, "widgets")

window.ipcRenderer = ipcRenderer

window.hwid = hwid

/**
 * Reads a file as a string, which is parsed by JSON.parse into a manifest object
 * @param manifestFile filepath to read from
 */
window.readManifest = (manifestFile: string): ManifestJSON => {
  const file = fs.readFileSync(manifestFile, { encoding: "utf8" })
  return JSON.parse(file) as ManifestJSON
}

window.readWidgetSettings = (widgetSettingsFile: string): WidgetSettingsJSON | null => {
  if (!fs.existsSync(widgetSettingsFile)) {
    console.log("Warning, widget settings file does not exist!", widgetSettingsFile)
    return null
  }
  const file = fs.readFileSync(widgetSettingsFile, { encoding: "utf8" })
  try {
    return JSON.parse(file)
  } catch (err) {
    console.log("Failed to parse the widget_settings.json file.", err)
    return null
  }
}

/**
 * Reads a directory for a list of folder names (not files)
 * @param directory The directory to read from
 */
window.readFolders = (directory: string): string[] => {
  if (!fs.existsSync(directory)) {
    console.log("Warning, directory does not exist!", directory)
    return []
  }
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}

/**
 * Reads a directory for a list of zip files
 * @param directory The directory to read from
 */
function readZips(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    console.log("Warning, widget zip files do not exist in directory!", directory)
    return []
  }
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(".zip"))
    .map(entry => entry.name)
}

/* The following code blocks below enables the widget loading and reloading for the application
 * Widget .zip files and the widget_settings.json are located in the $HOME/.mira/widgets path,
 * and these are copied over to the local application's installation directory where the index.html resides
 * and is served when the application is started up.
 *
 * Before each startup, this folder is cleared and the files are (re)copied over so that the widgets and
 * settings are thoroughly refreshed.
 */

// Decompress widget zips from $HOME directory's .mira folder: ~/.mira/widgets/
rimraf.sync(window.widgetDir)
const miraDir = path.join(remote.app.getPath("home"), ".mira")
const widgetDir = path.join(miraDir, "widgets")
readZips(widgetDir)
  .map(filename => path.join(widgetDir, filename))
  .forEach(filePath => {
    const zip = new AdmZip(filePath)
    const manifest = JSON.parse(zip.readAsText(MANIFEST, "utf8")) as ManifestJSON
    zip.extractAllTo(path.join(window.widgetDir, manifest.id))
  })

// Copy over widget_settings.json
const widgetSettingsFile = path.join(miraDir, WIDGET_SETTINGS)
if (fs.existsSync(widgetSettingsFile)) {
  fs.copyFileSync(widgetSettingsFile, path.join(window.widgetDir, WIDGET_SETTINGS))
}
