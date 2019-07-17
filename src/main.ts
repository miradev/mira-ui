import { app, BrowserWindow } from "electron"
import * as path from "path"

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
  win.loadFile(path.join(app.getAppPath(), "renderer", "index.html"))
  win.setMenuBarVisibility(false)
  win.on("closed", () => {
    win = null
  })
}

app.on("ready", createWindow)

app.on("window-all-closed", () => app.quit())

app.on("activate", () => {
  if (win === null) {
    createWindow()
  }
})
