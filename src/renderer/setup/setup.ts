;(() => {
  const deviceId = window.hwid.mac + "-" + window.hwid.serial
  const didSpan = document.getElementById("did")! as HTMLSpanElement
  const urlSpan = document.getElementById("url")! as HTMLSpanElement
  const url = `${window.serverConfig.serverUrl}:${window.serverConfig.frontendPort}/#/`
  didSpan.innerText = deviceId
  urlSpan.innerText = url

  const encodedUrl = encodeURI(`${window.serverConfig.protocol}://${url}qr/${deviceId}`)
  // @ts-ignore
  new QRCode(document.getElementById("qrcode"), {
    text: encodedUrl,
    width: 256,
    height: 256,
    // @ts-ignore
    correctLevel: QRCode.CorrectLevel.H,
  })
})()
