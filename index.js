const { app, BrowserWindow } = require("electron")

// Global reference of the window object to avoid garbage collection
let win = null

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    fullscreen: true,
    backgroundColor: "#000000",
  })
  win.setMenuBarVisibility(false)
  win.loadFile("index.html")
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
