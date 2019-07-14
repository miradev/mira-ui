const { Widget } = require("../widget.js")

class Clock extends Widget {
  run() {
    const p = document.createElement("p")
    p.textContent = "Clock"
    this.root.appendChild(p)
  }
}

module.exports = Clock
