import * as path from "path"
import * as fs from "fs"

const TOKEN_FILENAME = "token"

export interface ServerConfig {
  protocol: string
  serverUrl: string
  serverPort: string
}

const defaultConfig: ServerConfig = {
  protocol: "http",
  serverUrl: "192.168.0.35",
  serverPort: "8000",
}

export interface UpdateData {
  id: string
  fileName: string
  config: object
}

export function readConfig(directory: string): ServerConfig {
  const fileName = path.join(directory, "config.json")
  if (fs.existsSync(fileName)) {
    const file = fs.readFileSync(fileName, { encoding: "utf-8" })
    const config: ServerConfig = JSON.parse(file)
    if (config.protocol && config.serverUrl && config.serverPort) {
      return config
    }
  }
  return defaultConfig
}

export function readToken(directory: string): string | null {
  const fileName = path.join(directory, TOKEN_FILENAME)
  if (fs.existsSync(fileName)) {
    const file = fs.readFileSync(fileName, { encoding: "utf-8" })
    if (file.length > 0) {
      return file
    }
  }
  return null
}

export function writeToken(directory: string, value: string): void {
  const fileName = path.join(directory, TOKEN_FILENAME)
  fs.writeFileSync(fileName, value, { encoding: "utf-8" })
}

export function removeTokenIfExists(directory: string): void {
  const fileName = path.join(directory, TOKEN_FILENAME)
  if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName)
  }
}
