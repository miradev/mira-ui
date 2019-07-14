import * as AdmZip from "adm-zip"
import * as path from "path"
import config from "./config"
import { readFolders, readZips } from "./utils"
import { readManifest } from "./widget/manifest"
;(() => {
  // Loads widgets on startup

  const zipFiles = readZips(config.widgetDirectory)

  zipFiles.forEach(zipFile => {
    // TODO: read each zip file and extract to folders
    console.log(zipFile)
  })
})()
