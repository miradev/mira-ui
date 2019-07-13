function main() {
  const rootNode = document.getElementById("app")
  const p = document.createElement("p")
  p.textContent = "weather"
  rootNode.appendChild(p)
}

module.exports = main
