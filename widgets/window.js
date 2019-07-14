const { isWidgetSubclass } = require("./widget.js")

const path = require("path")
const fs = require("fs")

const widgetFolders = getFolders(__dirname)

widgetFolders.forEach(folder => {
  const manifestFile = path.join(__dirname, folder, "manifest.json")
  const manifest = readManifest(manifestFile, folder)

  const mainFile = path.join(__dirname, folder, manifest.js)
  if (fs.existsSync(mainFile)) {
    const WidgetClass = require(mainFile)
    if (isWidgetSubclass(WidgetClass)) {
      const widget = new WidgetClass(manifest)
      widget.run()
    }
  }
})

function getFolders(rootFolder) {
  return fs
    .readdirSync(rootFolder, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}

function readManifest(manifestFile, folder) {
  if (fs.existsSync(manifestFile)) {
    const json = fs.readFileSync(manifestFile)
    const manifest = JSON.parse(json)
    return manifest
  }
  // Default manifest if reading failed
  return {
    id: folder,
    js: "main.js",
  }
}
