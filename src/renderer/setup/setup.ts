;(() => {
  const deviceId = window.hwid.mac + "-" + window.hwid.serial
  const did = document.getElementById("did")! as HTMLSpanElement
  const url = document.getElementById("url")! as HTMLSpanElement
  did.innerText = deviceId
  url.innerText = window.serverConfig.serverUrl + "/" + window.serverConfig.serverPort

  // @ts-ignore
  new QRCode(document.getElementById("qrcode"), {
    text: deviceId,
    width: 256,
    height: 256,
    // @ts-ignore
    correctLevel: QRCode.CorrectLevel.H,
  })
})()
