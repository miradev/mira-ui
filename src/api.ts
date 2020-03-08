import * as http from "http"
import * as fs from "fs"
import * as path from "path"

export interface DownloadOptions {
  miraDirectory: string
  widgetId: string
  fileName: string
  serverUrl: string
}

export function downloadWidget(options: DownloadOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    const outputName = `${options.widgetId}.zip`
    const outputPath = path.join(options.miraDirectory, "widgets", outputName)
    const file = fs.createWriteStream(outputPath)

    http.get(`${options.serverUrl}/files/${options.fileName}`, res => {
      const { statusCode } = res
      if (statusCode !== 200) {
        reject(statusCode)
      }
      res.pipe(file)
    })
    file.on("finish", resolve)
  })
}
