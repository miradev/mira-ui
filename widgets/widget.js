class Widget {
  constructor(manifest) {
    this.manifest = manifest
    const rootNode = document.getElementById("app")
    const div = document.createElement("div")
    div.id = manifest.id
    rootNode.appendChild(div)
    this.root = div
  }
}

function isWidgetSubclass(clazz) {
  return typeof clazz === "function" && /class .+ extends Widget/.test(clazz.toString())
}

module.exports = {
  Widget,
  isWidgetSubclass,
}
