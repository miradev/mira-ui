const { app, BrowserWindow } = require("electron")
const path = require("path")

// Global reference of the window object to avoid garbage collection
let win = null

const windowFile = path.join(__dirname, "widgets", "window.html")

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    fullscreen: true,
    backgroundColor: "#FFFFFF",
  })
  win.loadFile(windowFile)
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
