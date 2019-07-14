import { remote } from "electron"
import * as fs from "fs"
import * as path from "path"
import { IManifestJSON } from "./manifest"
import * as AdmZip from "adm-zip"

const doc = document as any
const win = window as any

doc.createRootDiv = (id: string): HTMLDivElement => {
  const miraRoot = document.getElementById("mira")
  const root = document.createElement("div")
  root.id = id
  miraRoot.appendChild(root)
  return root
}

win.pathJoin = path.join

win.srcDir = __dirname

win.widgetDir = path.join(__dirname, "widgets")

/**
 * Reads a file as a string, which is parsed by JSON.parse into a manifest object
 * @param manifestFile filepath to read from
 */
win.readManifest = (manifestFile: string): IManifestJSON => {
  const file = fs.readFileSync(manifestFile, { encoding: "utf8" })
  return JSON.parse(file) as IManifestJSON
}

/**
 * Reads a directory for a list of folder names (not files)
 * @param directory The directory to read from
 */
win.readFolders = (directory: string): string[] => {
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
const zipDir = path.join(remote.app.getPath("userData"), "widgets")
readZips(zipDir)
  .map(filename => path.join(zipDir, filename))
  .forEach(filePath => {
    const zip = new AdmZip(filePath)
    const manifest = JSON.parse(zip.readAsText("manifest.json", "utf8")) as IManifestJSON
    zip.extractAllTo(path.join(win.widgetDir, manifest.id))
  })
