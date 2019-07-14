import { remote } from "electron"
import * as path from "path"

export interface IConfig {
  widgetDirectory: string
}

const config: IConfig = {
  widgetDirectory: path.join(remote.app.getPath("userData"), "widgets"),
}

export default config
