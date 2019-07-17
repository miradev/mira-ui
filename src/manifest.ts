/**
 * Interface representation of a manifest.json file
 */
export interface ManifestJSON {
  id: string
  name: string
  version: string
  author: string
  entrypoint: {
    js: string
    css?: string
  }
}
