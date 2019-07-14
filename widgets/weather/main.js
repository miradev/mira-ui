const { Widget } = require("../widget.js")

class Weather extends Widget {
  run() {
    const p = document.createElement("p")
    p.textContent = "Weather"
    this.root.appendChild(p)
  }
}

module.exports = Weather
