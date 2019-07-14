import * as fs from "fs"
import * as path from "path"

/**
 * Reads a directory for a list of folder names (not files)
 * @param directory The directory to read from
 */
export function readFolders(directory: string): string[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}

/**
 * Reads a directory for a list of zip files
 * @param directory The directory to read from
 */
export function readZips(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(".zip"))
    .map(entry => entry.name)
}
