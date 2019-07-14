import * as fs from "fs"

export interface IEntrypoint {
  js: string
  css?: string
}

export interface IManifestJSON {
  id: string
  name: string
  version: string
  author: string
  entrypoint: IEntrypoint
}

export function readManifest(manifestFile: string): IManifestJSON {
  const file = fs.readFileSync(manifestFile, { encoding: "utf8" })
  return JSON.parse(file) as IManifestJSON
}
