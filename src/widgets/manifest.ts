import * as fs from "fs"

/**
 * Interface representation of a manifest.json file
 */
export interface IManifestJSON {
  id: string
  name: string
  version: string
  author: string
  entrypoint: {
    js: string
    css?: string
  }
}

/**
 * Reads a file as a string, which is parsed by JSON.parse into a manifest object
 * @param manifestFile filepath to read from
 */
export function readManifest(manifestFile: string): IManifestJSON {
  const file = fs.readFileSync(manifestFile, { encoding: "utf8" })
  return JSON.parse(file) as IManifestJSON
}
