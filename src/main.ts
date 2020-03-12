import { app, BrowserWindow, globalShortcut, ipcMain } from "electron"
import * as path from "path"
import WebsocketHandler from "./ws"
import { readConfig, readToken, checkWidgetsFolder, ServerConfig } from "./config"
import { setInterval } from "timers"
import * as express from "express"

app.allowRendererProcessReuse = true

// Load config
const miraDirectory = path.join(app.getPath("home"), ".mira")
const config: ServerConfig = readConfig(miraDirectory)

// Global reference of the window object to avoid garbage collection
let win: Electron.BrowserWindow | null = null
let wsh: WebsocketHandler | null = null

function tokenExists(): boolean {
  return readToken(miraDirectory) !== null
}

// Initialize
checkWidgetsFolder(miraDirectory)

function localServer(window: Electron.BrowserWindow) {
  const expressApp = express()
  expressApp.use(express.json())

  const listenPort = 3000

  expressApp.post("/motion", (req, res) => {
    const direction = req.body.direction
    console.log(direction)
    switch (direction) {
      case "up":
        window.webContents.send("!left", true)
        break
      case "down":
        window.webContents.send("!right", true)
        break
    }
    res.status(200)
    res.send()
  })

  expressApp.listen(listenPort, () => {
    console.log(`Listening on port ${listenPort}`)
  })
}

function createMainWindow(): void {
  const token: string | null = readToken(miraDirectory)
  wsh = new WebsocketHandler(config, miraDirectory, token)

  win = new BrowserWindow({
    backgroundColor: "#000000",
    fullscreen: true,
    webPreferences: {
      contextIsolation: false,
      preload: path.join(app.getAppPath(), "preload.js"),
    },
  })

  globalShortcut.register("F3", () => {
    win?.webContents.send("!wake", true)
  })

  globalShortcut.register("F1", () => {
    win?.webContents.send("!sleep", true)
  })

  globalShortcut.register("F5", () => {
    app.relaunch()
    app.quit()
  })

  globalShortcut.register("Left", () => {
    win?.webContents.send("!left", true)
  })

  globalShortcut.register("Right", () => {
    win?.webContents.send("!right", true)
  })

  win.loadFile(path.join(app.getAppPath(), "renderer", "index.html"))
  win.setMenuBarVisibility(false)
  win.on("closed", () => {
    globalShortcut.unregisterAll()
    win = null
  })

  ipcMain.on("msg", (event, args) => {
    console.log(event, args)
  })

  wsh.initialize({
    invalidToken: () => {
      // On websocket "invalidated" close, restart app without token file
      app.relaunch()
      app.quit()
    },
    update: () => {
      // setTimeout(() => {
      app.relaunch()
      app.quit()
      // }, 500)
    },
  })

  localServer(win)
}

function createSetupWindow(): void {
  wsh = new WebsocketHandler(config, miraDirectory, null)

  win = new BrowserWindow({
    backgroundColor: "#000000",
    fullscreen: true,
    webPreferences: {
      contextIsolation: false,
      preload: path.join(app.getAppPath(), "preload-setup.js"),
    },
  })

  win.loadFile(path.join(app.getAppPath(), "renderer", "setup", "index.html"))
  win.setMenuBarVisibility(false)

  wsh.initialize()

  let timer = setInterval(() => {
    if (tokenExists()) {
      clearInterval(timer)
      app.relaunch()
      app.quit()
    }
  }, 1000)
}

app.on("ready", () => {
  if (!tokenExists()) {
    createSetupWindow()
  } else {
    createMainWindow()
  }
})

app.on("window-all-closed", () => app.quit())

app.on("activate", () => {
  if (win === null) {
    if (!tokenExists()) {
      createSetupWindow()
    } else {
      createMainWindow()
    }
  }
})
