import { app, BrowserWindow } from "electron"
import * as path from "path"

// Global reference of the window object to avoid garbage collection
let win: Electron.BrowserWindow = null

function createWindow() {
  win = new BrowserWindow({
    backgroundColor: "#000000",
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
    },
  })
  win.loadFile(path.join(__dirname, "window.html"))
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
