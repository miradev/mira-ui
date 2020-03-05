import { remote } from "electron"
import * as hwid from "@/hwid"
import * as path from "path"
import { readConfig } from "@/config"

const miraDirectory = path.join(remote.app.getPath("home"), ".mira")
const config = readConfig(miraDirectory)

window.hwid = hwid
window.serverConfig = config
