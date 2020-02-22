;(() => {
  const deviceId = window.hwid.mac + "-" + window.hwid.serial
  const did = document.getElementById("did")! as HTMLParagraphElement
  did.innerText = deviceId

  // @ts-ignore
  new QRCode(document.getElementById("qrcode"), {
    text: deviceId,
    width: 256,
    height: 256,
    // @ts-ignore
    correctLevel : QRCode.CorrectLevel.H
  })
})()
