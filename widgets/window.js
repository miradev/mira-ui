const path = require("path")
const fs = require("fs")

const widgetFolders = getFolders(__dirname)

widgetFolders.forEach(name => {
  const mainFile = path.join(__dirname, name, "main.js")
  const existsMain = fs.existsSync(mainFile)
  if (existsMain) {
    require(mainFile)()
  }
})

function getFolders(rootFolder) {
  return fs
    .readdirSync(rootFolder, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}
