import * as path from "path"
import * as fs from "fs"

export interface Config {
  serverUrl: string
  serverPort: string
}

const defaultConfig: Config = {
  serverUrl: "192.168.0.35",
  serverPort: "8000",
}

export function readConfig(directory: string): Config {
  const fileName = path.join(directory, "config.json")
  if (fs.existsSync(fileName)) {
    const file = fs.readFileSync(fileName, { encoding: "utf-8" })
    const config: Config = JSON.parse(file)
    return config
  }
  return defaultConfig
}
