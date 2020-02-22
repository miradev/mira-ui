import { app, BrowserWindow, globalShortcut, ipcMain } from "electron"
import * as path from "path"
import * as WebSocket from "ws"
import WebsocketHandler from "./ws"
import { readConfig } from "./config"

// Load config
const miraDirectory = path.join(app.getPath("home"), ".mira")
const config = readConfig(miraDirectory)

// Initialize websockets
const ws = new WebSocket(`ws://${config.serverUrl}:${config.serverPort}`)
const wsh = new WebsocketHandler(ws)

// Global reference of the window object to avoid garbage collection
let win: Electron.BrowserWindow | null = null

function createWindow() {
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

  win.loadFile(path.join(app.getAppPath(), "renderer", "index.html"))
  win.setMenuBarVisibility(false)
  win.on("closed", () => {
    globalShortcut.unregisterAll()
    win = null
  })

  ipcMain.on("msg", (event, args) => {
    console.log(event, args)
  })

  wsh.initialize()
}

app.on("ready", createWindow)

app.on("window-all-closed", () => app.quit())

app.on("activate", () => {
  if (win === null) {
    createWindow()
  }
})
