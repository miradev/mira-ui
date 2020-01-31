import * as AdmZip from "adm-zip"
import { remote } from "electron"
import * as fs from "fs"
import * as path from "path"
import { ManifestJSON } from "./manifest"
import rimraf = require("rimraf")

document.createRootDiv = (id: string): HTMLDivElement => {
  const root = document.createElement("div")
  root.id = id
  document.body.appendChild(root)
  return root
}

window.pathJoin = path.join

window.srcDir = __dirname

window.widgetDir = path.join(__dirname, "widgets")

/**
 * Reads a file as a string, which is parsed by JSON.parse into a manifest object
 * @param manifestFile filepath to read from
 */
window.readManifest = (manifestFile: string): ManifestJSON => {
  const file = fs.readFileSync(manifestFile, { encoding: "utf8" })
  return JSON.parse(file) as ManifestJSON
}

/**
 * Reads a directory for a list of folder names (not files)
 * @param directory The directory to read from
 */
window.readFolders = (directory: string): string[] => {
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
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(".zip"))
    .map(entry => entry.name)
}

// Decompress widget zips
rimraf.sync(window.widgetDir)
const zipDir = path.join(remote.app.getPath("userData"), "widgets")
readZips(zipDir)
  .map(filename => path.join(zipDir, filename))
  .forEach(filePath => {
    const zip = new AdmZip(filePath)
    const manifest = JSON.parse(zip.readAsText("manifest.json", "utf8")) as ManifestJSON
    zip.extractAllTo(path.join(window.widgetDir, manifest.id))
  })
