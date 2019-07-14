import { remote } from "electron"
import * as path from "path"

export interface IConfig {
  widgetDirectory: string
  appDirectory: string
}

/**
 * Configuration struct which holds information about the application's main directory,
 * as well as the widget directory in use.
 */
const config: IConfig = {
  appDirectory: remote.app.getAppPath(),
  widgetDirectory: path.join(remote.app.getPath("userData"), "widgets"),
}

export default config
